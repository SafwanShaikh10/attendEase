const prisma = require('../config/prisma');

// POST /api/admin/substitutes/assign
async function assignSubstitute(req, res) {
  try {
    const { absentUserId, substituteUserId, roleCovered, expiresAt } = req.body;

    if (!absentUserId || !substituteUserId || !roleCovered || !expiresAt)
      return res.status(400).json({ error: 'All fields are required' });

    if (!['CLASS_COORD', 'YEAR_COORD'].includes(roleCovered))
      return res.status(400).json({ error: 'Substitutes only allowed for CLASS_COORD or YEAR_COORD' });

    const substitute = await prisma.substituteApprover.create({
      data: {
        absentUserId: parseInt(absentUserId),
        substituteUserId: parseInt(substituteUserId),
        roleCovered: roleCovered,
        active: true,
        expiresAt: new Date(expiresAt)
      }
    });

    res.json({ message: 'Substitute assigned.', substitute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/admin/substitutes/:id/deactivate
async function deactivateSubstitute(req, res) {
  try {
    await prisma.substituteApprover.update({
      where: { id: parseInt(req.params.id) },
      data: { active: false }
    });
    res.json({ message: 'Substitute deactivated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/substitutes
async function listSubstitutes(req, res) {
  try {
    const list = await prisma.substituteApprover.findMany({
      where: { active: true },
      include: {
        absentUser: { select: { name: true, role: true } },
        substituteUser: { select: { name: true, role: true } }
      }
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/reports/overview
async function getOverview(req, res) {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.attendanceRequest.count(),
      prisma.attendanceRequest.count({
        where: { status: { in: ['SUBMITTED','CLASS_COORD_APPROVED','YEAR_COORD_APPROVED'] } }
      }),
      prisma.attendanceRequest.count({
        where: { status: { in: ['YEAR_COORD_APPROVED','CHAIRPERSON_APPROVED'] } }
      }),
      prisma.attendanceRequest.count({ where: { status: 'REJECTED' } })
    ]);

    res.json({ total, pending, approved, rejected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/reports/pending-stale
// Requests pending more than 48hrs
async function getStalePending(req, res) {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stale = await prisma.attendanceRequest.findMany({
      where: {
        status: { in: ['SUBMITTED','CLASS_COORD_APPROVED','YEAR_COORD_APPROVED'] },
        submittedAt: { lt: cutoff }
      },
      include: { student: { select: { name: true, division: true, year: true } } },
      orderBy: { submittedAt: 'asc' }
    });
    res.json(stale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/reports/high-usage
// Students close to or exceeding leave limits
async function getHighUsage(req, res) {
  try {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        OR: [
          { odUsed: { gte: 4 } },
          { medicalUsed: { gte: 4 } }
        ]
      },
      include: { student: { select: { name: true, division: true, year: true } } },
      orderBy: { odUsed: 'desc' }
    });
    res.json(balances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/reports/approval-rates
async function getApprovalRates(req, res) {
  try {
    const coordinators = await prisma.user.findMany({
      where: { role: { in: ['CLASS_COORD','YEAR_COORD','CHAIRPERSON'] } },
      select: { id: true, name: true, role: true }
    });

    const rates = await Promise.all(coordinators.map(async (coord) => {
      const [approved, rejected] = await Promise.all([
        prisma.auditLog.count({
          where: {
            performedBy: coord.id,
            action: { in: ['CLASS_COORD_APPROVED','YEAR_COORD_APPROVED','CHAIRPERSON_APPROVED'] }
          }
        }),
        prisma.auditLog.count({
          where: { performedBy: coord.id, action: 'REJECTED' }
        })
      ]);
      const total = approved + rejected;
      return {
        coordinator: coord.name,
        role: coord.role,
        approved,
        rejected,
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : null
      };
    }));

    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  assignSubstitute, deactivateSubstitute, listSubstitutes,
  getOverview, getStalePending, getHighUsage, getApprovalRates,
  getUsers
};
