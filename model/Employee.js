import mongoose from 'mongoose';
const { Schema } = mongoose;

const employeeSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;