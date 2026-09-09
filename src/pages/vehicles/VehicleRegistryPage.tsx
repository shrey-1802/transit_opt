import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { vehiclesService } from '../../api/vehiclesService';
import { Vehicle, VehicleStatus, VehicleType } from '../../types/vehicle';
import { Badge } from '../../components/common/Badge';
import { Drawer } from '../../components/common/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const VehicleRegistryPage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'reg' | 'odometer' | 'capacity' | 'cost'>('reg');

  // Drawer / Add / Edit state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    type: 'Heavy Truck' as VehicleType,
    maxLoadCapacity: 20000,
    odometer: 0,
    acquisitionCost: 120000,
    region: 'Central Hub',
    year: 2024,
    serviceIntervalKm: 20000,
  });

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await vehiclesService.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openAddDrawer = () => {
    setEditingVehicle(null);
    setFormData({
      registrationNumber: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      model: '',
      type: 'Heavy Truck',
      maxLoadCapacity: 22000,
      odometer: 0,
      acquisitionCost: 145000,
      region: 'Central Hub',
      year: 2024,
      serviceIntervalKm: 20000,
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      model: v.model,
      type: v.type,
      maxLoadCapacity: v.maxLoadCapacity,
      odometer: v.odometer,
      acquisitionCost: v.acquisitionCost,
      region: v.region,
      year: v.year,
      serviceIntervalKm: v.serviceIntervalKm,
    });
    setIsDrawerOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.registrationNumber.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'Registration number is required.' });
      return;
    }
    if (!formData.model.trim()) {
      showToast({ type: 'error', title: 'Validation', message: 'Vehicle make/model is required.' });
      return;
    }

    try {
      if (editingVehicle) {
        await vehiclesService.updateVehicle(editingVehicle.id, formData);
        showToast({ type: 'success', title: 'Asset Updated', message: `Vehicle ${formData.registrationNumber} records updated.` });
      } else {
        await vehiclesService.createVehicle(formData);
        showToast({ type: 'success', title: 'Vehicle Provisioned', message: `Vehicle ${formData.registrationNumber} entered fleet registry.` });
      }
      setIsDrawerOpen(false);
      loadVehicles();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  const handleDeleteVehicle = async (id: string, reg: string) => {
    if (!window.confirm(`Confirm decommissioning and removal of vehicle ${reg}? Destructive action.`)) {
      return;
    }
    try {
      await vehiclesService.deleteVehicle(id);
      showToast({ type: 'success', title: 'Decommissioned', message: `Vehicle ${reg} removed from active database.` });
      loadVehicles();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  // Filtered & sorted data
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchesQuery =
          v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.region.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        const matchesType = typeFilter === 'All' || v.type === typeFilter;
        return matchesQuery && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'odometer') return b.odometer - a.odometer;
        if (sortBy === 'capacity') return b.maxLoadCapacity - a.maxLoadCapacity;
        if (sortBy === 'cost') return b.acquisitionCost - a.acquisitionCost;
        return a.registrationNumber.localeCompare(b.registrationNumber);
      });
  }, [vehicles, searchQuery, statusFilter, typeFilter, sortBy]);

  const getStatusBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case 'Available': return 'available';
      case 'On Trip': return 'ontrip';
      case 'In Shop': return 'inshop';
      case 'Retired': return 'retired';
      default: return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Vehicle Registry & Asset Twin</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Comprehensive fleet inventory, capacity limits, lifecycle states, and digital twin telemetry.
          </p>
        </div>

        {can('canManageVehicles') && (
          <button onClick={openAddDrawer} className="btn btn-primary">
            <Plus size={16} /> Register New Asset
          </button>
        )}
      </div>

      {/* Control Bar: Search, Filters, Sorting */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search registration, model, region..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
            >
              <option value="All">All Types</option>
              <option value="Heavy Truck">Heavy Truck</option>
              <option value="Semi-Trailer">Semi-Trailer</option>
              <option value="Van">Van</option>
              <option value="Flatbed">Flatbed</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
            >
              <option value="reg">Registration (A-Z)</option>
              <option value="capacity">Payload Capacity</option>
              <option value="odometer">Odometer (High-Low)</option>
              <option value="cost">Acquisition Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Registry Table */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Registration No.</th>
              <th>Make & Model</th>
              <th>Asset Type</th>
              <th>Max Capacity</th>
              <th>Odometer</th>
              <th>Acquisition Cost</th>
              <th>Status</th>
              <th>Health / Efficiency</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading Fleet Assets...
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No vehicles match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredVehicles.map(v => (
                <tr key={v.id}>
                  <td>
                    <NavLink
                      to={`/vehicles/${v.id}`}
                      style={{
                        fontWeight: 700,
                        color: 'var(--color-olive-700)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {v.registrationNumber}
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </NavLink>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Year {v.year} • {v.region}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.model}</div>
                    {v.assignedDriverName && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Driver: {v.assignedDriverName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.type}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{v.maxLoadCapacity.toLocaleString()} kg</span>
                  </td>
                  <td>
                    <span style={{ fontFeatureSettings: '"tnum"' }}>{v.odometer.toLocaleString()} km</span>
                  </td>
                  <td>
                    <span style={{ fontFeatureSettings: '"tnum"' }}>${v.acquisitionCost.toLocaleString()}</span>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(v.status)}>{v.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: v.healthScore > 80 ? 'var(--color-olive-600)' : '#C47828' }}>
                        {v.healthScore}/100
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({v.fuelEfficiency} km/L)
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <NavLink
                        to={`/vehicles/${v.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        Twin View
                      </NavLink>
                      {can('canManageVehicles') && (
                        <button
                          onClick={() => openEditDrawer(v)}
                          className="btn btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                          title="Edit Vehicle"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {can('canDeleteVehicles') && (
                        <button
                          onClick={() => handleDeleteVehicle(v.id, v.registrationNumber)}
                          className="btn btn-ghost"
                          style={{ padding: '0.35rem', color: 'var(--status-critical-text)' }}
                          title="Decommission Vehicle"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Vehicle Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingVehicle ? `Edit Asset: ${editingVehicle.registrationNumber}` : 'Register New Transport Asset'}
        subtitle="Provision physical truck or trailer into the digital operations twin"
      >
        <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Registration Plate Number *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.registrationNumber}
              onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="e.g. TRX-9020"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Make & Model *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Volvo FH16 750"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Classification / Body Type</label>
            <select
              className="form-control"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as VehicleType })}
            >
              <option value="Heavy Truck">Heavy Truck</option>
              <option value="Semi-Trailer">Semi-Trailer</option>
              <option value="Van">Van</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Tanker">Tanker</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Max Load Capacity (kg) *</label>
              <input
                type="number"
                className="form-control"
                required
                min={500}
                max={60000}
                value={formData.maxLoadCapacity}
                onChange={e => setFormData({ ...formData, maxLoadCapacity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Odometer (km)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={formData.odometer}
                onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Acquisition Cost ($)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={formData.acquisitionCost}
                onChange={e => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model Year</label>
              <input
                type="number"
                className="form-control"
                min={2000}
                max={2030}
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Operational Hub / Region</label>
              <input
                type="text"
                className="form-control"
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                placeholder="Central Hub"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Service Interval (km)</label>
              <input
                type="number"
                className="form-control"
                min={5000}
                value={formData.serviceIntervalKm}
                onChange={e => setFormData({ ...formData, serviceIntervalKm: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
