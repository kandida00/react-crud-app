import React, { useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { User } from '../App';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: '60%',
    },
};

interface IUserModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSubmit: (data: User) => void;
    selectedUser: User | null;
}

const UserModal = ({ isOpen, closeModal, onSubmit, selectedUser }: IUserModalProps) => {
    const [date, setDate] = React.useState(new Date());

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<User>();

    const onFormSubmit: SubmitHandler<User> = (data: User) => {
        onSubmit(data);
        closeModal();
    }

    const options = ['Admin', 'User'];

    const handleChange = (dateChange: any) => {
        setValue("birthday", dateChange, {
            shouldDirty: true
        });
        setDate(dateChange);
    };

    useEffect(() => {
        if (selectedUser) {
            setValue("role", selectedUser.role);
            setValue("name", selectedUser.name);
            setValue("username", selectedUser.username);
            setValue("email", selectedUser.email);
            setValue("birthday", new Date(selectedUser.birthday));
        } else {
            reset();
        }
    }, [selectedUser, setValue, reset]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
        >
            <h2>{selectedUser ? 'Edit User' : 'Add User'}</h2>

            <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                    <label>Name</label>
                    <input {...register("name", { required: true })} />
                </div>
                <div>
                    <label>Username</label>
                    <input {...register("username", { required: true })} />
                </div>
                <div>
                    <label>Email</label>
                    <input type='email' {...register("email", { required: true })} />
                </div>
                <div>
                    <label>Role</label>
                    <Controller
                        name='role'
                        control={control}
                        render={({ field }) => (
                            <select {...field} >{options.map((option, index) => <option key={index} value={option}>{option}</option>)}</select>
                        )}
                    />
                </div>
                <div>
                    <label>Birthday</label>
                    <Controller
                        name='birthday'
                        control={control}
                        defaultValue={date}
                        render={({ field }) => (
                            <DatePicker onChange={handleChange} selected={date} />
                        )}
                    />
                </div>

                <button type='submit'>{selectedUser ? 'Update User' : 'Add User'}</button>
            </form>
        </Modal>
    );
}

export default UserModal;