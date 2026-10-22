import Student from '../models/Student.js';
import AuditLog from '../models/AuditLog.js';

export async function getStudents(req, res, next) {
  try {
    const { branch, search } = req.query;
    const query = { isActive: true };

    if (branch) query.branch = branch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query).sort({ registrationId: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const { registrationId, name, email, branch, year, contactNumber } = req.body;

    const existing = await Student.findOne({
      $or: [{ registrationId: registrationId.toUpperCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({ message: 'Registration ID or Email already registered' });
    }

    const student = await Student.create({
      registrationId: registrationId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      branch,
      year: year || '4th Year (Batch of 2026)',
      contactNumber: contactNumber || '',
    });

    await AuditLog.create({
      actorName: req.user?.name || 'Admin',
      action: 'STUDENT_CREATED',
      targetType: 'Student',
      targetId: student._id.toString(),
      details: `Created student ${student.name} (${student.registrationId})`,
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function importStudents(req, res, next) {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students provided for import' });
    }

    const imported = [];
    for (const item of students) {
      const exists = await Student.findOne({ registrationId: item.registrationId.toUpperCase() });
      if (!exists) {
        const doc = await Student.create({
          registrationId: item.registrationId.toUpperCase(),
          name: item.name,
          email: item.email.toLowerCase(),
          branch: item.branch,
          year: item.year || '4th Year (Batch of 2026)',
          contactNumber: item.contactNumber || '',
        });
        imported.push(doc);
      }
    }

    await AuditLog.create({
      actorName: req.user?.name || 'Admin',
      action: 'STUDENTS_IMPORTED',
      targetType: 'Student',
      targetId: 'batch',
      details: `Imported ${imported.length} new candidates`,
    });

    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (err) {
    next(err);
  }
}
