import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  CheckCircle,
  Wrench,
  Navigation,
  Clock,
  UserCheck,
  Percent,
  TrendingUp,
  Fuel,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { analyticsService } from '../../api/analyticsService';
import { alertsService } from '../../api/alertsService';
import { dispatchService } from '../../api/dispatchService';
import { DashboardKPIs, RoiTrendPoint, FuelWeeklyTrendPoint, MaintenanceCostTrendPoint } from '../../types/analytics';
import { Alert } from '../../types/alert';
import { Trip } from '../../types/trip';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [roiTrends, setRoiTrends] = useState<RoiTrendPoint[]>([]);
  const [fuelTrends, setFuelTrends] = useState<FuelWeeklyTrendPoint[]>([]);
  const [maintTrends, setMaintTrends] = useState<MaintenanceCostTrendPoint[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, roiRes, fuelRes, maintRes, alertsRes, tripsRes] = await Promise.all([
        analyticsService.getDashboardKPIs(),
        analyticsService.getRoiTrends(),
        analyticsService.getFuelWeeklyTrends(),
        analyticsService.getMaintenanceTrends(),
        alertsService.getAlerts(),
        dispatchService.getTrips(),
      ]);

      setKpis(kpiRes);
      setRoiTrends(roiRes);
      setFuelTrends(fuelRes);
      setMaintTrends(maintRes);
      setRecentAlerts(alertsRes.slice(0, 4));
      setActiveTrips(tripsRes.filter(t => t.status === 'Dispatched' || t.status === 'In Progress'));
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Operations Mission Control
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time fleet telemetry, dispatch status, asset profitability, and safety monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
          {/* Filter: Vehicle Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
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

          {/* Filter: Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>

          {/* Filter: Region */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Region:</span>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
            >
              <option value="All">All Regions</option>
              <option value="North Corridor">North Corridor</option>
              <option value="Central Hub">Central Hub</option>
              <option value="Southern Link">Southern Link</option>
              <option value="Metro Express">Metro Express</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            title="Refresh Telemetry"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* 7 Core KPIs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <MetricCard
          title="Active Vehicles"
          value={kpis ? kpis.activeVehicles : '—'}
          subtitle="En route on active hauls"
          icon={Truck}
          trend={{ value: '+1 today', isPositive: true }}
        />

        <MetricCard
          title="Available Vehicles"
          value={kpis ? kpis.availableVehicles : '—'}
          subtitle="Ready for dispatch assignment"
          icon={CheckCircle}
          trend={{ value: 'Ready pool', isPositive: true }}
        />

        <MetricCard
          title="In Maintenance"
          value={kpis ? kpis.vehiclesInMaintenance : '—'}
          subtitle="In shop / Bay service"
          icon={Wrench}
          badge="Shop Locked"
        />

        <MetricCard
          title="Active Trips"
          value={kpis ? kpis.activeTrips : '—'}
          subtitle="Dispatched or in progress"
          icon={Navigation}
          trend={{ value: '100% on schedule', isPositive: true }}
        />

        <MetricCard
          title="Pending Trips"
          value={kpis ? kpis.pendingTrips : '—'}
          subtitle="Drafted orders awaiting dispatch"
          icon={Clock}
          badge="Queue"
        />

        <MetricCard
          title="Drivers On Duty"
          value={kpis ? kpis.driversOnDuty : '—'}
          subtitle="Available + En Route"
          icon={UserCheck}
          trend={{ value: '0 violations', isPositive: true }}
        />

        <MetricCard
          title="Fleet Utilization"
          value={kpis ? `${kpis.fleetUtilizationPercentage}%` : '—'}
          subtitle="Operational assets engaged"
          icon={Percent}
          trend={{ value: '+3.4% vs last week', isPositive: true }}
        />
      </div>

      {/* Visual Analytics & Operational Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* ROI Margin & Profitability Trend */}
        <div className="card" style={{ gridColumn: 'span 8', minHeight: '340px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--color-olive-600)" />
                Vehicle ROI & Operational Margin Trend
              </div>
              <div className="card-subtitle">
                Formula: (Revenue − (Maintenance + Fuel)) / Acquisition Cost
              </div>
            </div>
            <NavLink to="/reports" className="btn btn-ghost" style={{ fontSize: '0.8rem', gap: '0.25rem' }}>
              Full Financial Report <ArrowUpRight size={14} />
            </NavLink>
          </div>

          {/* Elegant SVG/CSS Trend Bar & Margin Visualizer */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '0 1rem', gap: '1.5rem' }}>
              {roiTrends.map((pt, i) => {
                const heightPercent = Math.round((pt.roiPercentage / 30) * 100);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-olive-700)', marginBottom: '0.35rem' }}>
                      {pt.roiPercentage}%
                    </div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '48px',
                        height: `${Math.max(15, heightPercent)}%`,
                        backgroundColor: 'var(--color-olive-600)',
                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                        opacity: 0.85 + (i * 0.03),
                        transition: 'height 0.4s ease',
                      }}
                      title={`Revenue: $${pt.revenue.toLocaleString()} | Cost: $${pt.operationalCost.toLocaleString()}`}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {pt.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-subtle)', marginTop: '0.85rem', paddingTop: '0.85rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Fleet Margin</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>+$37,416 / mo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Annualized ROI</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-olive-700)' }}>24.1%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue to Cost Ratio</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>1.95x</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Alerts Feeder */}
        <div className="card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#C47828" />
                Active Alerts
              </div>
              <div className="card-subtitle">Compliance, service, and safety flags</div>
            </div>
            <NavLink to="/alerts" className="btn btn-ghost" style={{ fontSize: '0.78rem' }}>
              View All
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: `1px solid ${
                    alert.severity === 'critical'
                      ? 'var(--status-critical-border)'
                      : alert.severity === 'warning'
                      ? 'var(--status-warning-border)'
                      : 'var(--border-subtle)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {alert.title}
                  </span>
                  <Badge
                    size="sm"
                    variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'olive'}
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Dispatches & Weekly Fuel Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Active Dispatches */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Live Dispatched Hauls</div>
              <div className="card-subtitle">Automated state engine monitoring active cargo en route</div>
            </div>
            <NavLink to="/dispatch" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              Open Dispatch Engine
            </NavLink>
          </div>

          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Trip Code</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No dispatches currently en route. Dispatch available from Smart Dispatch module.
                    </td>
                  </tr>
                ) : (
                  activeTrips.map(trip => (
                    <tr key={trip.id}>
                      <td style={{ fontWeight: 700 }}>{trip.tripCode}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{trip.destination.split(' ')[0]}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>from {trip.source.split(' ')[0]}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-olive-700)' }}>{trip.vehicleReg}</span>
                      </td>
                      <td>{trip.driverName}</td>
                      <td>{trip.cargoWeightKg.toLocaleString()} kg</td>
                      <td>
                        <Badge variant="ontrip">{trip.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Fuel Intelligence */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Fuel size={18} color="var(--color-olive-600)" />
                Weekly Fuel Consumption
              </div>
              <div className="card-subtitle">Distance / Fuel efficiency telemetry</div>
            </div>
            <NavLink to="/fuel" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              Details
            </NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {fuelTrends.map(item => (
              <div key={item.week} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.week}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.liters.toLocaleString()} Liters consumed
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    ${item.fuelCost.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-olive-700)', fontWeight: 600 }}>
                    {item.averageKmPerL} km/L avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
