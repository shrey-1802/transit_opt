import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Calendar,
  Gauge,
  DollarSign,
  TrendingUp,
  FileText,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle,
  Wrench,
  Fuel,
  MapPin,
  Check
} from 'lucide-react';
import { vehiclesService } from '../../api/vehiclesService';
import { VehicleDigitalTwinData, VehicleLifecycleState } from '../../types/vehicle';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const VehicleTwinPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [twinData, setTwinData] = useState<VehicleDigitalTwinData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'fuel' | 'maintenance' | 'profitability' | 'documents'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Document upload state
  const [uploadDocType, setUploadDocType] = useState('Insurance');
  const [isUploading, setIsUploading] = useState(false);
  const [docList, setDocList] = useState<any[]>([
    {
      id: 'doc-1',
      name: 'Commercial Fleet Policy 2026.pdf',
      type: 'Insurance',
      fileSize: '1.4 MB',
      uploadedAt: '2026-01-10',
      expiresAt: '2027-01-10',
      status: 'Valid',
    },
    {
      id: 'doc-2',
      name: 'DOT Federal Annual Inspection.pdf',
      type: 'Inspection Certificate',
      fileSize: '840 KB',
      uploadedAt: '2026-02-14',
      expiresAt: '2027-02-14',
      status: 'Valid',
    }
  ]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await vehiclesService.getVehicleDigitalTwin(id);
        if (!data) {
          showToast({ type: 'error', title: 'Not Found', message: 'Vehicle twin not found.' });
          navigate('/vehicles');
          return;
        }
        setTwinData(data);
      } catch (err: any) {
        showToast({ type: 'error', title: 'Load Error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate, showToast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Max allowed file size is 10 MB.' });
      return;
    }

    setIsUploading(true);
    try {
      const doc = await vehiclesService.uploadDocument(id, file, uploadDocType);
      setDocList(prev => [doc, ...prev]);
      showToast({ type: 'success', title: 'Document Stored', message: `${file.name} saved to vehicle compliance ledger.` });
    } catch {
      showToast({ type: 'error', title: 'Upload Failed', message: 'Could not store document.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !twinData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Calibrating Digital Twin & Telemetry Sensors...
      </div>
    );
  }

  const { vehicle } = twinData;

  const lifecycleStages: { key: VehicleLifecycleState; label: string }[] = [
    { key: 'Purchased', label: 'Purchased' },
    { key: 'Available', label: 'Available' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'On Trip', label: 'On Trip' },
    { key: 'Maintenance', label: 'In Shop' },
    { key: 'Retired', label: 'Retired' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Button & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/vehicles')} className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }}>
            <ArrowLeft size={16} /> Registry
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                {vehicle.registrationNumber}
              </h1>
              <Badge variant={vehicle.status === 'Available' ? 'available' : vehicle.status === 'On Trip' ? 'ontrip' : vehicle.status === 'In Shop' ? 'inshop' : 'retired'}>
                {vehicle.status}
              </Badge>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {vehicle.model} • {vehicle.type} • {vehicle.region} Hub
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <NavLink to="/dispatch" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
            Smart Dispatch Pool
          </NavLink>
        </div>
      </div>

      {/* Lifecycle Visualizer */}
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Asset Lifecycle Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '5%',
              right: '5%',
              top: '50%',
              height: '2px',
              backgroundColor: 'var(--border-medium)',
              zIndex: 1,
              transform: 'translateY(-50%)',
            }}
          />
          {lifecycleStages.map(stage => {
            const isCurrent = vehicle.lifecycleState === stage.key || vehicle.status === stage.key;
            return (
              <div
                key={stage.key}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? 'var(--color-olive-700)' : 'var(--bg-surface)',
                    border: `2px solid ${isCurrent ? 'var(--color-olive-700)' : 'var(--border-medium)'}`,
                    color: isCurrent ? 'var(--color-beige-100)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {isCurrent ? <Check size={16} /> : stage.label[0]}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--color-olive-700)' : 'var(--text-muted)',
                  }}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini ERP Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '0.25rem' }}>
        {[
          { key: 'overview', label: 'Asset Overview' },
          { key: 'trips', label: `Dispatched Trips (${twinData.recentTrips.length})` },
          { key: 'fuel', label: 'Fuel Intelligence' },
          { key: 'maintenance', label: 'Maintenance Timeline' },
          { key: 'profitability', label: 'ROI & Profitability' },
          { key: 'documents', label: `Documents (${docList.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.65rem 1.15rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.85rem',
              color: activeTab === tab.key ? 'var(--color-olive-900)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-olive-700)' : '3px solid transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div className="card" style={{ gridColumn: 'span 6' }}>
            <div className="card-header">
              <div className="card-title">Physical Asset Specifications</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration Number</span>
                <span style={{ fontWeight: 700 }}>{vehicle.registrationNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Make & Model</span>
                <span style={{ fontWeight: 600 }}>{vehicle.model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Classification</span>
                <span style={{ fontWeight: 600 }}>{vehicle.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Payload Capacity</span>
                <span style={{ fontWeight: 700 }}>{vehicle.maxLoadCapacity.toLocaleString()} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Odometer</span>
                <span style={{ fontWeight: 700 }}>{vehicle.odometer.toLocaleString()} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Acquisition Cost</span>
                <span style={{ fontWeight: 700 }}>${vehicle.acquisitionCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: 'span 6' }}>
            <div className="card-header">
              <div className="card-title">Digital Twin Health & Service Tracker</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Overall Health Score</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-olive-700)' }}>{vehicle.healthScore} / 100</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${vehicle.healthScore}%`, height: '100%', backgroundColor: 'var(--color-olive-600)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Service Interval Progress</span>
                  <span style={{ fontWeight: 700 }}>{twinData.serviceProgressPercent}% toward next service</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${twinData.serviceProgressPercent}%`, height: '100%', backgroundColor: twinData.serviceProgressPercent > 80 ? '#C47828' : 'var(--color-olive-600)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  <span>Last: {vehicle.lastServiceOdometer.toLocaleString()} km</span>
                  <span>Target: {twinData.nextServiceOdometer.toLocaleString()} km</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fuel Efficiency</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-olive-700)' }}>{vehicle.fuelEfficiency} km/L</div>
                </div>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated Net ROI</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-olive-700)' }}>{twinData.roiPercentage ?? 'N/A'}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dispatched Trips */}
      {activeTab === 'trips' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Historical & Active Trip Deployments</div>
          </div>
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Origin & Destination</th>
                  <th>Driver</th>
                  <th>Cargo Payload</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {twinData.recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No active dispatches on file for this vehicle unit.
                    </td>
                  </tr>
                ) : (
                  twinData.recentTrips.map(trip => (
                    <tr key={trip.id}>
                      <td style={{ fontWeight: 700 }}>{trip.tripCode}</td>
                      <td>{trip.source} → {trip.destination}</td>
                      <td>{trip.driverName}</td>
                      <td>{trip.cargoWeightKg.toLocaleString()} kg</td>
                      <td>${trip.revenue.toLocaleString()}</td>
                      <td><Badge variant={trip.status === 'Completed' ? 'available' : 'ontrip'}>{trip.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Fuel */}
      {activeTab === 'fuel' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Fuel Ingestion Telemetry</div>
          </div>
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Station</th>
                  <th>Liters</th>
                  <th>Cost</th>
                  <th>Odometer</th>
                  <th>Efficiency</th>
                  <th>Anomaly Flag</th>
                </tr>
              </thead>
              <tbody>
                {twinData.fuelHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No fuel logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  twinData.fuelHistory.map(f => (
                    <tr key={f.id}>
                      <td>{f.date}</td>
                      <td>{f.stationName}</td>
                      <td>{f.liters} L</td>
                      <td>${f.totalCost.toFixed(2)}</td>
                      <td>{f.odometer.toLocaleString()} km</td>
                      <td>{f.fuelEfficiencyKmPerL} km/L</td>
                      <td>
                        {f.isAbnormalConsumption ? (
                          <Badge variant="critical">Abnormal Spike</Badge>
                        ) : (
                          <Badge variant="available">Nominal</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Maintenance & Workshop History</div>
          </div>
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Facility / Technician</th>
                  <th>Start Date</th>
                  <th>Cost</th>
                  <th>Priority</th>
                  <th>Shop Status</th>
                </tr>
              </thead>
              <tbody>
                {twinData.maintenanceTimeline.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Zero maintenance incidents logged for this asset.
                    </td>
                  </tr>
                ) : (
                  twinData.maintenanceTimeline.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.type}</td>
                      <td>{m.technicianOrShop}</td>
                      <td>{m.startDate.split('T')[0]}</td>
                      <td>${m.cost.toLocaleString()}</td>
                      <td><Badge variant={m.priority === 'High' ? 'warning' : 'olive'}>{m.priority}</Badge></td>
                      <td><Badge variant={m.status === 'Completed' ? 'available' : 'inshop'}>{m.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Profitability */}
      {activeTab === 'profitability' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div className="card" style={{ gridColumn: 'span 12' }}>
            <div className="card-header">
              <div className="card-title">Unit Asset Profit & Loss (P&L) Ledger</div>
              <div className="card-subtitle">
                Formula: (Lifetime Revenue − (Maintenance + Fuel)) / Acquisition Cost
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  ${twinData.totalRevenue.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operating Expenses (Fuel + Maint)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-critical-text)', marginTop: '0.25rem' }}>
                  ${(twinData.totalFuelCost + twinData.totalMaintenanceCost).toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Operational Margin</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-olive-700)', marginTop: '0.25rem' }}>
                  ${twinData.netProfit.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--color-olive-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-olive-300)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-olive-800)', fontWeight: 600 }}>Capital ROI Yield</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-olive-900)', marginTop: '0.25rem' }}>
                  {twinData.roiPercentage !== null ? `${twinData.roiPercentage}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Documents & Compliance */}
      {activeTab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          <div className="card" style={{ gridColumn: 'span 5' }}>
            <div className="card-header">
              <div className="card-title">Upload Compliance File</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Document Category</label>
                <select
                  className="form-control"
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value)}
                >
                  <option value="Insurance">Insurance Policy</option>
                  <option value="Registration">Registration Card</option>
                  <option value="Inspection Certificate">DOT Inspection Certificate</option>
                  <option value="Emission Test">Emission Test Record</option>
                  <option value="Road Tax">Road Tax Certificate</option>
                </select>
              </div>

              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-hover)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Upload size={32} color="var(--color-olive-600)" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Click or drop document to upload</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supports PDF, PNG, JPEG up to 10 MB
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: 'span 7' }}>
            <div className="card-header">
              <div className="card-title">Uploaded Compliance Certificates</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {docList.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="var(--color-olive-600)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.type} • {doc.fileSize} • Uploaded {doc.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <Badge variant="available">Valid</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
