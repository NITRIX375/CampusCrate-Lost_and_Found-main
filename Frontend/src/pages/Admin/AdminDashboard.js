// src/pages/Admin/AdminDashboard.js
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, CircularProgress,Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AdminDashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
   // const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

        const fetchData = async () => {
        console.log("entry!!");
        try {
            await api.get('/api/auth/profile');
            const [itemsRes, usersRes] = await Promise.all([
                api.get('/api/admin/items'),
                api.get('/api/admin/users')
            ]);
            console.log("Hlwww",itemsRes.data);
            setItems(itemsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            toast.error(error.response?.status === 403 ? "Access Denied: Admins only." : "Failed to fetch data.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // added -1 
        const fetchReports = async () => {
      try {
        const { data } = await api.get('/api/admin/reports');
        console.log("punjabii",data);
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

      useEffect(() => {
    fetchReports();
  }, []);

    useEffect(() => {
        fetchData();
    }, [navigate]);
    
    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const handleApproveItem = async (id) => {
    try {
        console.log('Approving item with ID:', id);
        const response = await axios.patch(
            `/api/admin/items/${id}/approve`, 
            {}, // No body needed, just confirm approval (you can also pass other data if needed)
            { withCredentials: true }
        );
        toast.success("Item approved!");
        fetchData(); // Refresh data after approval
        console.log('Approval response:', response);
    } catch (error) {
        toast.error("Failed to approve item.");
        console.log('Error approving item:', error);
    }
};

    
    const handleDeleteItem = async (id) => {
        if (window.confirm("Delete this item post?")) {
            try {
                console.log(id);
               // await api.delete(`/api/admin/items/${id}`);
                toast.success("Item deleted!");
                fetchData();
            } catch (error) { toast.error("Failed to delete item."); }
        }
    };

    const handleToggleBlockUser = async (id) => {
        try {
            const user = users.find(u => u._id === id);
            await api.patch(`/api/admin/users/${id}/block`, {});
            toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'}!`);
            fetchData();
        } catch (error) { toast.error("Action failed."); }



    };

    //added

     const handleUpdateStatus = async (reportId, status) => {
    try {
      await api.patch(`/api/admin/reports/${reportId}/status`, { status });
      
      console.log("wassup!1");
      setReports((prevReports) => 
        prevReports.map((report) =>
          report._id === reportId ? { ...report, status } : report
        )
      );
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };




    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

    
    
    const pendingItems = items.filter(item => !item.isApproved);
    const approvedItems = items.filter(item => item.isApproved);


    return (
        <Box>
            <Typography variant="h3" component="h1" gutterBottom>Admin Dashboard</Typography>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label={`Pending Items (${pendingItems.length})`} />
                <Tab label="All Approved Items" />
                <Tab label="Manage Users" />
                <Tab label = "Reports from Users"/>
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <ItemTable items={pendingItems} onApprove={handleApproveItem} onDelete={handleDeleteItem} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ItemTable items={approvedItems} onDelete={handleDeleteItem} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <UserTable users={users} onToggleBlock={handleToggleBlockUser} />
            </TabPanel>

                  <TabPanel value={tabValue} index={3}>
        <ReportsTable reports={reports} onUpdateStatus={handleUpdateStatus} />
      </TabPanel>

              {/* <Typography variant="h3" component="h1" gutterBottom>
        Admin Dashboard - Abuse Reports
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Title</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.itemId.title}</TableCell>
                <TableCell>{report.reportedBy.name}</TableCell>
                <TableCell>{report.description}</TableCell>
                <TableCell>
                  <Chip label={report.status} color={report.status === 'resolved' ? 'success' : 'warning'} />
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleUpdateStatus(report._id, 'reviewed')} 
                    variant="outlined" 
                    color="primary" 
                    sx={{ mr: 1 }}
                    disabled={report.status !== 'pending'}
                  >
                    Mark as Reviewed
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus(report._id, 'resolved')} 
                    variant="outlined" 
                    color="success"
                    disabled={report.status !== 'reviewed'}
                  >
                    Mark as Resolved
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}




        </Box>
    );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

const ItemTable = ({ items, onApprove, onDelete }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Title</TableCell><TableCell>Type</TableCell><TableCell>Posted By</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item._id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell><Chip label={item.type} size="small" color={item.type === 'lost' ? 'error' : 'secondary'} /></TableCell>
                        <TableCell>{item.postedBy?.name || 'N/A'}</TableCell>
                        <TableCell><Chip label={item.isApproved ? item.status : 'Pending'} size="small" /></TableCell>
                        <TableCell align="right">
                            {!item.isApproved && onApprove && <IconButton color="success" onClick={() => onApprove(item._id)}><CheckIcon /></IconButton>}
                            {onDelete && <IconButton color="error" onClick={() => onDelete(item._id)}><DeleteIcon /></IconButton>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const UserTable = ({ users, onToggleBlock }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell>
                        <TableCell><Chip label={user.role} size="small" color={user.role === 'admin' ? 'primary' : 'default'} /></TableCell>
                        <TableCell><Chip label={user.isBlocked ? 'Blocked' : 'Active'} size="small" color={user.isBlocked ? 'error' : 'success'} /></TableCell>
                        <TableCell align="right">
                            {user.role !== 'admin' && (
                                <IconButton onClick={() => onToggleBlock(user._id)}>
                                    {user.isBlocked ? <CheckCircleOutlineIcon color="success" /> : <BlockIcon color="error" />}
                                </IconButton>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

//Added
// const ReportsTable = ({ reports, onUpdateStatus }) => (
//   <TableContainer component={Paper}>
//     <Table>
//       <TableHead>
//         <TableRow>
//           <TableCell>Item Title</TableCell>
//           <TableCell>Reported By</TableCell>
//           <TableCell>Description</TableCell>
//           <TableCell>Status</TableCell>
//           <TableCell>Actions</TableCell>
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {reports.map((report) => (
//           <TableRow key={report._id}>
//             <TableCell>{report.itemId?.title || 'N/A'}</TableCell>
//             <TableCell>{report.reportedBy?.name || 'N/A'}</TableCell>
//             <TableCell>{report.description}</TableCell>
//             <TableCell>
//               <Chip
//                 label={report.status}
//                 color={
//                   report.status === 'resolved'
//                     ? 'success'
//                     : report.status === 'reviewed'
//                     ? 'primary'
//                     : 'warning'
//                 }
//               />
//             </TableCell>
//             <TableCell>
//               <Button
//                 onClick={() => onUpdateStatus(report._id, 'reviewed')}
//                 variant="outlined"
//                 color="primary"
//                 sx={{ mr: 1 }}
//                 disabled={report.status !== 'pending'}
//               >
//                 Mark as Reviewed
//               </Button>
//               <Button
//                 onClick={() => onUpdateStatus(report._id, 'resolved')}
//                 variant="outlined"
//                 color="success"
//                 disabled={report.status !== 'reviewed'}
//               >
//                 Mark as Resolved
//               </Button>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </TableContainer>
// );
const ReportsTable = ({ reports, onUpdateStatus }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Item Title</TableCell>
          <TableCell>Reported By</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report._id}>
            <TableCell>{report.itemId?.title || 'N/A'}</TableCell>
            <TableCell>{report.reportedBy?.name || 'N/A'}</TableCell>
            <TableCell>{report.description}</TableCell>
            <TableCell>
              <Chip
                label={report.status}
                color={
                  report.status === 'resolved'
                    ? 'success'
                    : report.status === 'reviewed'
                    ? 'primary'
                    : 'warning'
                }
              />
            </TableCell>
            <TableCell>
              <Button
                onClick={() => onUpdateStatus(report._id, 'reviewed')}
                variant="outlined"
                color="primary"
                sx={{ mr: 1 }}
                disabled={report.status !== 'pending'}
              >
                Mark as Reviewed
              </Button>
              <Button
                onClick={() => onUpdateStatus(report._id, 'resolved')}
                variant="outlined"
                color="success"
                disabled={report.status !== 'reviewed'}
              >
                Mark as Resolved
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
export default AdminDashboard;