import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const employeesData = [
    { id: 1, name: 'Alice Johnson', status: 'Actively assigned', location: 'Substation 1', email: 'alice.johnson@example.com', phone: '123-456-7890', role: 'Manager' },
    { id: 2, name: 'Bob Smith', status: 'On leave', location: 'Substation 2', email: 'bob.smith@example.com', phone: '234-567-8901', role: 'Attendant' },
    { id: 3, name: 'Charlie Brown', status: 'Actively assigned', location: 'Substation 3', email: 'charlie.brown@example.com', phone: '345-678-9012', role: 'Manager' },
    { id: 4, name: 'Diana Prince', status: 'Actively assigned', location: 'Substation 4', email: 'diana.prince@example.com', phone: '456-789-0123', role: 'Attendant' },
    { id: 5, name: 'Ethan Hunt', status: 'On leave', location: 'Substation 5', email: 'ethan.hunt@example.com', phone: '567-890-1234', role: 'Manager' }
];

const ManagerDashboard = () => {
    const [employees, setEmployees] = useState(employeesData);
    const [showModal, setShowModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', location: '', role: 'Manager' });
    const navigate = useNavigate();

    const handleNewEmployeeChange = (e) => {
        setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
    };

    const registerNewEmployee = () => {
        setEmployees([...employees, { id: employees.length + 1, ...newEmployee, status: 'Pending' }]);
        setNewEmployee({ name: '', email: '', phone: '', location: '', role: 'Manager' });
        setShowModal(false);
    };

    const handleRowClick = () => {
        navigate(`/dashboard`);
    };

    return (
        <div className="dashboard text-white w-full bg-[#211F1E] min-h-screen p-4">
            {/* Navbar */}
            <nav className="shadow-sm px-6 py-3 flex justify-between items-center bg-gray-900 rounded-lg">
                <div>
                    <h2 className="text-lg font-semibold">Manager: John Doe</h2>
                    <p className="text-gray-400 text-sm">Location: Headquarters</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                    Add Employee
                </button>
            </nav>

            {/* Employee Table */}
            <section className="rounded-lg shadow-md p-6 mt-4 bg-gray-800">
                <h3 className="text-lg font-medium mb-4">Registered Employees</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Name</th>
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Role</th>
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Status</th>
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Location</th>
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Email</th>
                                <th className="py-3 px-4 text-left text-sm font-medium uppercase">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {employees.map(employee => (
                                <tr key={employee.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => handleRowClick()}>
                                    <td className="py-3 px-4">{employee.name}</td>
                                    <td className="py-3 px-4">{employee.role}</td>
                                    <td className="py-3 px-4">{employee.status}</td>
                                    <td className="py-3 px-4">{employee.location}</td>
                                    <td className="py-3 px-4">{employee.email}</td>
                                    <td className="py-3 px-4">{employee.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Add Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-medium mb-4">Register New Employee</h3>
                        <div className="space-y-3">
                            <input type="text" name="name" value={newEmployee.name} onChange={handleNewEmployeeChange} placeholder="Name" className="w-full p-2 border rounded-lg bg-gray-800 text-white" />
                            <input type="email" name="email" value={newEmployee.email} onChange={handleNewEmployeeChange} placeholder="Email" className="w-full p-2 border rounded-lg bg-gray-800 text-white" />
                            <input type="tel" name="phone" value={newEmployee.phone} onChange={handleNewEmployeeChange} placeholder="Phone number" className="w-full p-2 border rounded-lg bg-gray-800 text-white" />
                            <input type="text" name="location" value={newEmployee.location} onChange={handleNewEmployeeChange} placeholder="Location" className="w-full p-2 border rounded-lg bg-gray-800 text-white" />
                            <select name="role" value={newEmployee.role} onChange={handleNewEmployeeChange} className="w-full p-2 border rounded-lg bg-gray-800 text-white">
                                <option value="Manager">Manager</option>
                                <option value="Attendant">Attendant</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4 mt-4">
                            <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white cursor-pointer hover:bg-red-700 px-2 py-2 rounded-lg bg-red-500">Cancel</button>
                            <button onClick={registerNewEmployee} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer">Register</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;