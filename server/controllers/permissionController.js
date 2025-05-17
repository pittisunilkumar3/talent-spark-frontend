const { PermissionGroup } = require('../models/PermissionGroup');
const { PermissionCategory } = require('../models/PermissionCategory');
const { User } = require('../models/User');
const { Op } = require('sequelize');

// Get all permission groups with categories
exports.getPermissionGroupsWithCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build filter conditions
    const whereConditions = {};

    // Filter by is_active
    if (req.query.is_active !== undefined) {
      whereConditions.is_active = req.query.is_active === 'true';
    }

    // Filter by is_system
    if (req.query.is_system !== undefined) {
      whereConditions.is_system = req.query.is_system === 'true';
    }

    // Search by name, short_code, or description
    if (req.query.search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { short_code: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    console.log('Fetching permission groups with conditions:', whereConditions);

    // Get permission groups with pagination and include categories
    const { count, rows } = await PermissionGroup.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'CreatedBy',
          attributes: ['id', 'first_name', 'last_name', 'employee_id'],
        },
        {
          model: PermissionCategory,
          as: 'PermissionCategories',
          where: {
            is_active: true,
          },
          required: false, // LEFT JOIN
          order: [['display_order', 'ASC']],
        },
      ],
      order: [
        ['name', 'ASC'],
      ],
      limit,
      offset,
    });

    console.log(`Found ${count} permission groups, returning ${rows.length} rows`);
    if (rows.length > 0) {
      console.log('First group:', rows[0].name);
      console.log('Categories count:', rows[0].PermissionCategories ? rows[0].PermissionCategories.length : 0);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Error in getPermissionGroupsWithCategories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
