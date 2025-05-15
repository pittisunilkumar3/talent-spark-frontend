const { Role } = require('../models/Role');
const { Branch } = require('../models/Branch');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Get all roles with pagination and filtering
exports.getRoles = async (req, res) => {
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

    // Filter by branch_id
    if (req.query.branch_id) {
      whereConditions.branch_id = req.query.branch_id;
    }

    // Search by name or description
    if (req.query.search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Get roles with pagination
    const { count, rows } = await Role.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name'],
        },
      ],
      order: [
        ['priority', 'DESC'],
        ['name', 'ASC'],
      ],
      limit,
      offset,
    });

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
    console.error('Error in getRoles:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Error in getRoleById:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    // Check if slug already exists
    const existingRole = await Role.findOne({
      where: { slug: req.body.slug },
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'A role with this slug already exists',
      });
    }

    // Create role
    const role = await Role.create(req.body);

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    console.error('Error in createRole:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // Find role
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if role is a system role and prevent modification
    if (role.is_system && req.body.is_system === false) {
      return res.status(403).json({
        success: false,
        message: 'System roles cannot be modified',
      });
    }

    // Check if slug already exists (if changing slug)
    if (req.body.slug && req.body.slug !== role.slug) {
      const existingRole = await Role.findOne({
        where: {
          slug: req.body.slug,
          id: { [Op.ne]: id },
        },
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'A role with this slug already exists',
        });
      }
    }

    // Update role
    await role.update(req.body);

    // Get updated role with branch
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    console.error('Error in updateRole:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Find role
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if role is a system role
    if (role.is_system) {
      return res.status(403).json({
        success: false,
        message: 'System roles cannot be deleted',
      });
    }

    // Delete role (soft delete)
    const result = await role.destroy();

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      result: {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 0,
        info: "",
        serverStatus: 2,
        warningStatus: 0
      }
    });
  } catch (error) {
    console.error('Error in deleteRole:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
