import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Switch,
  FormControlLabel, RadioGroup, Radio, FormLabel, Divider,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Card, CardContent, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, OutlinedInput, Checkbox,
  Avatar, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

// Íconos de Material UI
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import KeyIcon from '@mui/icons-material/Key';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CircleIcon from '@mui/icons-material/Circle';

import axios from 'axios';
import { useSnackbar } from 'notistack';

const API_URL = `${import.meta.env.VITE_API_URL}/settings`; // Archivo ANTIGUO

function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE PESTAÑAS ---
  const [company, setCompany] = useState({
    id: '', name: '', legalName: '', rfc: '', phone: '', email: '', address: '', website: '',
    logo: '', thermalLogo: '', ticketHeader: '', ticketFooter: '', autoPrintReceipt: true, paperWidth: '80mm',
  });

  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // --- ESTADOS DE MODALES ---
  const [openStoreModal, setOpenStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', address: '', phone: '', ticketFooter: '' });

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [newRegister, setNewRegister] = useState({ name: '', code: '' });

  const [openUserModal, setOpenUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', roleId: '', stores: [] });

  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- CARGA DE DATOS SEGURO ---
  const loadData = async () => {
    try {
      const [compRes, storeRes, userRes, sessionRes, roleRes, payRes] = await Promise.all([
        axios.get(`${API_URL}/company`),
        axios.get(`${API_URL}/stores`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/users/active-sessions`),
        axios.get(`${API_URL}/roles`),
        axios.get(`${API_URL}/payment-methods`),
      ]);

      if (compRes.data) setCompany(compRes.data);
      setStores(Array.isArray(storeRes.data) ? storeRes.data : storeRes.data?.stores || []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data?.users || []);
      setActiveSessions(Array.isArray(sessionRes.data) ? sessionRes.data : sessionRes.data?.sessions || []);
      setRoles(Array.isArray(roleRes.data?.roles) ? roleRes.data.roles : (Array.isArray(roleRes.data) ? roleRes.data : []));
      setAvailablePermissions(Array.isArray(roleRes.data?.availablePermissions) ? roleRes.data.availablePermissions : []);
      setPaymentMethods(Array.isArray(payRes.data) ? payRes.data : payRes.data?.paymentMethods || []);
    } catch (error) {
      enqueueSnackbar('Error al cargar la configuración', { variant: 'error' });
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- ACCIONES 1: EMPRESA ---
  const handleSaveCompany = async () => {
    if (!company.id) return;
    setLoading(true);
    try {
      await axios.put(`${API_URL}/company/${company.id}`, company);
      enqueueSnackbar('Configuración de empresa guardada', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al actualizar la empresa', { variant: 'error' });
    } finally { setLoading(false); }
  };

  // --- ACCIONES 2: SUCURSALES & CAJAS ---
  const handleCreateStore = async () => {
    try {
      await axios.post(`${API_URL}/stores`, { ...newStore, companyId: company.id });
      enqueueSnackbar('Sucursal creada exitosamente', { variant: 'success' });
      setOpenStoreModal(false);
      setNewStore({ name: '', address: '', phone: '', ticketFooter: '' });
      loadData();
    } catch (error) { enqueueSnackbar('Error al crear sucursal', { variant: 'error' }); }
  };

  const handleCreateRegister = async () => {
    try {
      await axios.post(`${API_URL}/stores/${selectedStoreId}/registers`, newRegister);
      enqueueSnackbar('Caja creada con éxito', { variant: 'success' });
      setOpenRegisterModal(false);
      setNewRegister({ name: '', code: '' });
      loadData();
    } catch (error) { enqueueSnackbar('Error al crear caja', { variant: 'error' }); }
  };

  const handleToggleStoreStatus = async (storeId, active) => {
    try {
      await axios.patch(`${API_URL}/stores/${storeId}/status`, { active: !active });
      enqueueSnackbar('Estado de sucursal actualizado', { variant: 'info' });
      loadData();
    } catch (error) { enqueueSnackbar('Error al cambiar estado', { variant: 'error' }); }
  };

  // --- ACCIONES 3: USUARIOS ---
  const handleCreateUser = async () => {
    try {
      await axios.post(`${API_URL}/users`, newUser);
      enqueueSnackbar('Usuario registrado con éxito', { variant: 'success' });
      setOpenUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', roleId: '', stores: [] });
      loadData();
    } catch (error) { enqueueSnackbar('Error al crear usuario', { variant: 'error' }); }
  };

  const handleResetPassword = async () => {
    try {
      await axios.patch(`${API_URL}/users/${selectedUserId}/reset-password`, { newPassword });
      enqueueSnackbar('Contraseña restablecida correctamente', { variant: 'success' });
      setOpenPasswordModal(false);
      setNewPassword('');
    } catch (error) { enqueueSnackbar('Error al cambiar contraseña', { variant: 'error' }); }
  };

  const handleToggleUserStatus = async (userId, active) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}/status`, { active: !active });
      enqueueSnackbar('Estatus de usuario modificado', { variant: 'info' });
      loadData();
    } catch (error) { enqueueSnackbar('Error al modificar estatus', { variant: 'error' }); }
  };

  // --- ACCIONES 4: PERMISOS POR ROL ---
  const handleTogglePermission = (roleId, code) => {
    const currentRoles = Array.isArray(roles) ? roles : [];
    setRoles(currentRoles.map(r => {
      if (r.id !== roleId) return r;
      const currentPerms = r.permissions || [];
      const exists = currentPerms.includes(code);
      const newPerms = exists ? currentPerms.filter(p => p !== code) : [...currentPerms, code];
      return { ...r, permissions: newPerms };
    }));
  };

  const handleSaveRolePermissions = async (role) => {
    try {
      await axios.put(`${API_URL}/roles/${role.id}/permissions`, {
        permissions: role.permissions || [],
        requiresApprovalForDiscount: role.requiresApprovalForDiscount || false,
        requiresApprovalForCancel: role.requiresApprovalForCancel || false,
      });
      enqueueSnackbar(`Permisos guardados para el rol ${role.name}`, { variant: 'success' });
    } catch (error) { enqueueSnackbar('Error al guardar permisos', { variant: 'error' }); }
  };

  // --- ACCIONES 5: MÉTODOS DE PAGO ---
  const handleSavePaymentMethod = async (method) => {
    try {
      await axios.put(`${API_URL}/payment-methods/${method.id}`, method);
      enqueueSnackbar('Método de pago actualizado', { variant: 'success' });
    } catch (error) { enqueueSnackbar('Error al actualizar método de pago', { variant: 'error' }); }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#F4EFFA', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#5B2C83', mb: 3 }}>
        Configuración del Sistema
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: '24px', p: 2, backgroundColor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '0.95rem' },
          }}
        >
          <Tab icon={<BusinessIcon />} iconPosition="start" label="1. Empresa & Ticket" />
          <Tab icon={<StoreIcon />} iconPosition="start" label="2. Sucursales & Cajas" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="3. Usuarios & Sesiones" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="4. Roles & Permisos" />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="5. Métodos de Pago" />
        </Tabs>

        {/* 🏢 1. DATOS DE LA EMPRESA & TICKETS */}
        <CustomTabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#5B2C83', mb: 2 }}>
                    Branding & Datos Fiscales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={company.logo} variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#F3E8FF' }}>
                          <ImageIcon sx={{ color: '#5B2C83' }} />
                        </Avatar>
                        <TextField
                          fullWidth size="small" label="Logo Color (Sistema)"
                          value={company.logo || ''} onChange={(e) => setCompany({ ...company, logo: e.target.value })}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={company.thermalLogo} variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#F3E8FF' }}>
                          <ImageIcon sx={{ color: '#5B2C83' }} />
                        </Avatar>
                        <TextField
                          fullWidth size="small" label="Logo Monocromático (POS)"
                          value={company.thermalLogo || ''} onChange={(e) => setCompany({ ...company, thermalLogo: e.target.value })}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}><TextField fullWidth size="small" label="Nombre Comercial" value={company.name || ''} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Razón Social" value={company.legalName || ''} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="RFC / Tax ID" value={company.rfc || ''} onChange={(e) => setCompany({ ...company, rfc: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Teléfono" value={company.phone || ''} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Correo" value={company.email || ''} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth size="small" label="Dirección Principal" value={company.address || ''} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth size="small" label="Sitio Web / Redes" value={company.website || ''} onChange={(e) => setCompany({ ...company, website: e.target.value })} /></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#5B2C83', mb: 2 }}>
                    Diseño e Impresión de Tickets POS
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth multiline rows={2} size="small" label="Encabezado del Ticket" value={company.ticketHeader || ''} onChange={(e) => setCompany({ ...company, ticketHeader: e.target.value })} /></Grid>
                    <Grid item xs={12}><TextField fullWidth multiline rows={2} size="small" label="Pie de Página Global" value={company.ticketFooter || ''} onChange={(e) => setCompany({ ...company, ticketFooter: e.target.value })} /></Grid>
                    <Grid item xs={12}>
                      <FormLabel sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ancho de Papel Térmico</FormLabel>
                      <RadioGroup row value={company.paperWidth || '80mm'} onChange={(e) => setCompany({ ...company, paperWidth: e.target.value })}>
                        <FormControlLabel value="80mm" control={<Radio color="secondary" />} label="80 mm (Estándar)" />
                        <FormControlLabel value="58mm" control={<Radio color="secondary" />} label="58 mm (Compacto)" />
                      </RadioGroup>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <FormControlLabel
                        control={<Switch checked={company.autoPrintReceipt} onChange={(e) => setCompany({ ...company, autoPrintReceipt: e.target.checked })} color="secondary" />}
                        label="Imprimir ticket automáticamente al completar la venta"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompany} disabled={loading} sx={{ backgroundColor: '#5B2C83', borderRadius: '12px', px: 4, py: 1.2, fontWeight: 'bold', textTransform: 'none' }}>
                Guardar Cambios de Empresa
              </Button>
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* 🏪 2. SUCURSALES & CAJAS REGISTRADORAS */}
        <CustomTabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sucursales y Cajas Asociadas</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenStoreModal(true)} sx={{ backgroundColor: '#5B2C83', borderRadius: '10px', textTransform: 'none', fontWeight: 'bold' }}>
              Nueva Sucursal
            </Button>
          </Box>

          <Grid container spacing={2}>
            {(Array.isArray(stores) ? stores : []).map((st) => (
              <Grid item xs={12} md={6} key={st.id}>
                <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StoreIcon sx={{ color: '#5B2C83' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{st.name}</Typography>
                        <Chip label={st.code} size="small" variant="outlined" />
                      </Box>
                      <FormControlLabel control={<Switch checked={st.active} onChange={() => handleToggleStoreStatus(st.id, st.active)} size="small" color="secondary" />} label={st.active ? "Activa" : "Inactiva"} />
                    </Box>
                    <Typography variant="body2" color="text.secondary"><strong>Dirección:</strong> {st.address || 'Sin especificar'}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Pie de Ticket Local:</strong> {st.ticketFooter || 'Usa pie global'}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#5B2C83' }}>Cajas Registradoras ({st.registers?.length || 0})</Typography>
                      <Button size="small" startIcon={<AddIcon />} onClick={() => { setSelectedStoreId(st.id); setOpenRegisterModal(true); }}>Añadir Caja</Button>
                    </Box>

                    <Grid container spacing={1}>
                      {(Array.isArray(st.registers) ? st.registers : []).map((reg) => (
                        <Grid item xs={6} key={reg.id}>
                          <Paper variant="outlined" sx={{ p: 1, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FAF7FC' }}>
                            <PointOfSaleIcon fontSize="small" sx={{ color: '#5B2C83' }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{reg.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{reg.code}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CustomTabPanel>

        {/* 👥 3. USUARIOS & SESIONES ACTIVAS */}
        <CustomTabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#2E7D32' }}>
            🔴 Sesiones / Turnos de Caja Activos
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {(Array.isArray(activeSessions) ? activeSessions : []).length === 0 ? (
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">No hay turnos de caja abiertos en este momento.</Typography></Grid>
            ) : (
              (Array.isArray(activeSessions) ? activeSessions : []).map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', borderLeft: '4px solid #2E7D32', bgcolor: '#F1F8E9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircleIcon sx={{ fontSize: 12, color: '#2E7D32' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{s.user?.firstName} {s.user?.lastName}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary"><strong>Sucursal:</strong> {s.register?.store?.name}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Caja:</strong> {s.register?.name}</Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Personal Registrado</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenUserModal(true)} sx={{ backgroundColor: '#5B2C83', borderRadius: '10px', textTransform: 'none', fontWeight: 'bold' }}>
              Nuevo Usuario
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold', color: '#5B2C83' } }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Sucursales Asignadas</TableCell>
                  <TableCell align="center">Estatus</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(Array.isArray(users) ? users : []).map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 'bold' }}>{u.firstName} {u.lastName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.role?.name || 'Sin Rol'} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{(Array.isArray(u.stores) ? u.stores : []).map((s) => s.store?.name || s.name).join(', ') || 'Todas'}</TableCell>
                    <TableCell align="center">
                      <Chip label={u.active ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: u.active ? '#E8F5E9' : '#FFEBEE', color: u.active ? '#2E7D32' : '#C62828', fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" startIcon={<KeyIcon />} onClick={() => { setSelectedUserId(u.id); setOpenPasswordModal(true); }}>Reset Pass</Button>
                      <Switch checked={u.active} onChange={() => handleToggleUserStatus(u.id, u.active)} color="secondary" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CustomTabPanel>

        {/* 🔑 4. ROLES & MATRIZ DE PERMISOS */}
        <CustomTabPanel value={activeTab} index={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Matriz Granular de Permisos por Rol</Typography>
          {(Array.isArray(roles) ? roles : []).map((r) => (
            <Accordion key={r.id} variant="outlined" sx={{ borderRadius: '12px', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#5B2C83' }}>{r.name}</Typography>
                  <Typography variant="caption" color="text.secondary">({r._count?.users || 0} usuarios asignados)</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Permisos del Módulo:</Typography>
                  </Grid>
                  {(Array.isArray(availablePermissions) ? availablePermissions : []).map((perm) => (
                    <Grid item xs={12} sm={6} md={4} key={perm.code}>
                      <FormControlLabel
                        control={<Checkbox checked={(r.permissions || []).includes(perm.code)} onChange={() => handleTogglePermission(r.id, perm.code)} />}
                        label={<Typography variant="body2"><strong>[{perm.module}]</strong> {perm.name}</Typography>}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={r.requiresApprovalForDiscount || false} onChange={(e) => setRoles(roles.map(item => item.id === r.id ? { ...item, requiresApprovalForDiscount: e.target.checked } : item))} color="secondary" />}
                      label="Requiere clave de supervisor para aplicar Descuentos"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={r.requiresApprovalForCancel || false} onChange={(e) => setRoles(roles.map(item => item.id === r.id ? { ...item, requiresApprovalForCancel: e.target.checked } : item))} color="secondary" />}
                      label="Requiere clave de supervisor para Cancelar Tickets"
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={() => handleSaveRolePermissions(r)} sx={{ backgroundColor: '#5B2C83', textTransform: 'none' }}>
                      Guardar Permisos de {r.name}
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CustomTabPanel>

        {/* 💳 5. MÉTODOS DE PAGO Y COMISIONES */}
        <CustomTabPanel value={activeTab} index={4}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Métodos de Pago Habilitados & Comisiones</Typography>
          <Grid container spacing={2}>
            {(Array.isArray(paymentMethods) ? paymentMethods : []).map((pm) => (
              <Grid item xs={12} md={6} key={pm.id}>
                <Card variant="outlined" sx={{ borderRadius: '16px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{pm.name}</Typography>
                      <Switch
                        checked={pm.enabled}
                        onChange={(e) => {
                          const updated = { ...pm, enabled: e.target.checked };
                          setPaymentMethods(paymentMethods.map(m => m.id === pm.id ? updated : m));
                          handleSavePaymentMethod(updated);
                        }}
                        color="secondary"
                      />
                    </Box>

                    {pm.code?.includes('CARD') && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth size="small" type="number" label="% Comisión Por Cobro"
                            value={pm.cardCommissionPercentage || 0}
                            onChange={(e) => setPaymentMethods(paymentMethods.map(m => m.id === pm.id ? { ...m, cardCommissionPercentage: parseFloat(e.target.value) } : m))}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={pm.applyCommissionToCustomer || false}
                                onChange={(e) => setPaymentMethods(paymentMethods.map(m => m.id === pm.id ? { ...m, applyCommissionToCustomer: e.target.checked } : m))}
                              />
                            }
                            label={<Typography variant="caption">Cobrar comisión al cliente</Typography>}
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button size="small" variant="outlined" onClick={() => handleSavePaymentMethod(pm)}>Guardar Comisión</Button>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CustomTabPanel>
      </Paper>

      {/* --- MODALES --- */}

      {/* Modal Nueva Sucursal */}
      <Dialog open={openStoreModal} onClose={() => setOpenStoreModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#5B2C83' }}>Crear Nueva Sucursal</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre Sucursal" size="small" fullWidth value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} />
            <TextField label="Dirección" size="small" fullWidth value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} />
            <TextField label="Teléfono Local" size="small" fullWidth value={newStore.phone} onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })} />
            <TextField label="Pie de Ticket Local" size="small" fullWidth value={newStore.ticketFooter} onChange={(e) => setNewStore({ ...newStore, ticketFooter: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenStoreModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateStore} sx={{ backgroundColor: '#5B2C83' }}>Guardar Sucursal</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nueva Caja */}
      <Dialog open={openRegisterModal} onClose={() => setOpenRegisterModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#5B2C83' }}>Añadir Caja Registradora</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre de Caja (ej: Caja 2)" size="small" fullWidth value={newRegister.name} onChange={(e) => setNewRegister({ ...newRegister, name: e.target.value })} />
            <TextField label="Código (ej: REG-02)" size="small" fullWidth value={newRegister.code} onChange={(e) => setNewRegister({ ...newRegister, code: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRegisterModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateRegister} sx={{ backgroundColor: '#5B2C83' }}>Guardar Caja</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nuevo Usuario */}
      <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#5B2C83' }}>Crear Usuario de Personal</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre" size="small" fullWidth value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
            <TextField label="Apellido" size="small" fullWidth value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
            <TextField label="Correo Electrónico" size="small" fullWidth type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <TextField label="Contraseña" size="small" fullWidth type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            
            <FormControl fullWidth size="small">
              <InputLabel>Rol de Usuario</InputLabel>
              <Select value={newUser.roleId} label="Rol de Usuario" onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Sucursales Asignadas</InputLabel>
              <Select
                multiple
                value={newUser.stores}
                onChange={(e) => setNewUser({ ...newUser, stores: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                input={<OutlinedInput label="Sucursales Asignadas" />}
                renderValue={(selected) => selected.map(id => stores.find(s => s.id === id)?.name || id).join(', ')}
              >
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    <Checkbox checked={newUser.stores.indexOf(store.id) > -1} />
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenUserModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateUser} sx={{ backgroundColor: '#5B2C83' }}>Crear Usuario</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Restablecer Contraseña */}
      <Dialog open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#5B2C83' }}>Restablecer Contraseña</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Nueva Contraseña"
              type="password"
              size="small"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPasswordModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleResetPassword} sx={{ backgroundColor: '#5B2C83' }}>Actualizar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}