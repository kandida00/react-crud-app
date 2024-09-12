import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ExcelExportParams, } from 'ag-grid-community';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { addUser, deleteUser, getUsers, updateUser } from './services/UserService';
import UserModal from './components/UserModal';
import moment from 'moment';
import * as XLSX from 'xlsx';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  birthday: Date;
  role: string;
}

function App() {
  const gridRef = useRef<AgGridReact<User>>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalIsOpen(true);
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  }


  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    fetchUsers();
  }

  const handleSubmit = async (data: User) => {
    if (selectedUser) {
      await updateUser({ ...data, id: selectedUser.id, birthday: moment(data.birthday).format('YYYY-MM-DD') });
    } else {
      await addUser({ ...data, id: (users.length + 1).toString(), birthday: moment(data.birthday).format('YYYY-MM-DD') });
    }
  }

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: 'ID', field: "id" },
      { headerName: 'Name', field: "name" },
      { headerName: 'Username', field: "username" },
      { headerName: 'Email', field: "email" },
      { headerName: 'Birthday', field: "birthday" },
      { headerName: 'Role', field: "role" },
      {
        headerName: 'Action', cellRenderer: (params: any) =>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <button onClick={() => handleEditUser(params.data)}>Edit</button>
            <button onClick={() => handleDeleteUser(params.data.id)}>Delete</button>
          </div>
      }
    ]
    , []);

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  }

  const defaultExcelExportParams = useMemo<ExcelExportParams>(() => {
    return {
      exportAsExcelTable: true,
    };
  }, []);

  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsCsv();
  }, []);

  const onBtImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<User>(worksheet);

        const formattedData = jsonData.map((item: any) => ({
          ...item,
          birthday: moment(item.birthday).toDate()
        }));

        setUsers(formattedData);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [])

  return (
    <div className="App" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={handleAddUser}>Add User</button>

        <button
          onClick={onBtExport}
          style={{ marginBottom: "5px", fontWeight: "bold" }}
        >
          Export to Excel
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <label>Import from Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ marginBottom: "5px" }}
            onChange={onBtImport}
          />
        </div>
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: 500 }}
      >
        <AgGridReact ref={gridRef} rowData={users} columnDefs={columnDefs} defaultExcelExportParams={defaultExcelExportParams} />
      </div>

      <UserModal isOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} onSubmit={handleSubmit} selectedUser={selectedUser} />
    </div>
  );
}

export default App;
