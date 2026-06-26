import Employee from '../model/Employee.js';

const serializeEmployee = (employee) => ({
    id: employee._id,
    firstname: employee.firstname,
    lastname: employee.lastname,
});

export const getAllEmployees = async (_req, res) => {
    try {
        const employees = await Employee.find().sort({ _id: 1 }).lean();
        res.json(employees.map(serializeEmployee));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createNewEmployee = async (req, res) => {
    const { firstname, lastname } = req.body;

    if (!firstname || !lastname) {
        return res.status(400).json({ message: 'First and last names are required.' });
    }

    try {
        const employee = await Employee.create({ firstname, lastname });
        res.status(201).json(serializeEmployee(employee));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateEmployee = async (req, res) => {
    const employeeId = req.body.id || req.params?.id;

    if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    try {
        const employee = await Employee.findById(employeeId).exec();
        if (!employee) {
            return res.status(404).json({ message: `Employee ID ${employeeId} not found` });
        }

        if (req.body.firstname) employee.firstname = req.body.firstname;
        if (req.body.lastname) employee.lastname = req.body.lastname;

        const updatedEmployee = await employee.save();
        res.json(serializeEmployee(updatedEmployee));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteEmployee = async (req, res) => {
    const employeeId = req.body.id || req.params?.id;

    if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    try {
        const employee = await Employee.findByIdAndDelete(employeeId).exec();
        if (!employee) {
            return res.status(404).json({ message: `Employee ID ${employeeId} not found` });
        }

        res.json({ message: `Employee ID ${employeeId} deleted` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await Employee.findById(id).exec();
        if (!employee) {
            return res.status(404).json({ message: `Employee ID ${id} not found` });
        }

        res.json(serializeEmployee(employee));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};