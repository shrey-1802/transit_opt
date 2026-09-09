import React, { useState, useEffect } from 'react';
import {
  Fuel,
  DollarSign,
  Plus,
  Receipt,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { fuelService } from '../../api/fuelService';
import { vehiclesService } from '../../api/vehiclesService';
import { FuelLog, ExpenseRecord, OperationalCostSummary, ExpenseCategory } from '../../types/fuel';
import { Vehicle } from '../../types/vehicle';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { MetricCard } from '../../components/common/MetricCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const FuelExpensesPage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [costSummary, setCostSummary] = useState<OperationalCostSummary | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  const [isLoading, setIsLoading] = useState(true);

  // Fuel Modal State
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    liters: 90,
    costPerLiter: 1.45,
    distanceSinceLastFill: 310,
    stationName: 'Love\'s Travel Stop #709',
  });

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Toll' as ExpenseCategory,
    vehicleId: '',
    amount: 45,
    description: 'Electronic Tollway Gate Pass',
    receiptNumber: 'RCP-2026-001',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fData, eData, sData, vData] = await Promise.all([
        fuelService.getFuelLogs(),
        fuelService.getExpenses(),
        fuelService.getOperationalCostSummary(),
        vehiclesService.getVehicles(),
      ]);
      setFuelLogs(fData);
      setExpenses(eData);
      setCostSummary(sData);
      setVehicles(vData);

      if (vData.length > 0 && !fuelForm.vehicleId) {
        setFuelForm(prev => ({ ...prev, vehicleId: vData[0].id }));
        setExpenseForm(prev => ({ ...prev, vehicleId: vData[0].id }));
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Load Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalCost = Number((fuelForm.liters * fuelForm.costPerLiter).toFixed(2));
      const newLog = await fuelService.logFuel({
        ...fuelForm,
        totalCost,
      });

      if (newLog.isAbnormalConsumption) {
        showToast({
          type: 'warning',
          title: 'Abnormal Consumption Flagged',
          message: `Fuel efficiency of ${newLog.fuelEfficiencyKmPerL} km/L deviates significantly from expected baseline. Alert raised.`,
        });
      } else {
        showToast({
          type: 'success',
          title: 'Fuel Logged',
          message: `${fuelForm.liters}L logged for ${newLog.vehicleReg}. Efficiency: ${newLog.fuelEfficiencyKmPerL} km/L.`,
        });
      }

      setIsFuelModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const veh = vehicles.find(v => v.id === expenseForm.vehicleId);
      await fuelService.logExpense({
        ...expenseForm,
        vehicleReg: veh?.registrationNumber,
      });

      showToast({
        type: 'success',
        title: 'Expense Recorded',
        message: `$${expenseForm.amount} booked under ${expenseForm.category}.`,
      });

      setIsExpenseModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Fuel & Operating Expense Intelligence</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Fuel telemetry, automated consumption anomaly detection, and operational expense auditing.
          </p>
        </div>

        {can('canManageFuelExpenses') && (
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setIsFuelModalOpen(true)} className="btn btn-primary">
              <Fuel size={16} /> Log Fuel Fill
            </button>
            <button onClick={() => setIsExpenseModalOpen(true)} className="btn btn-secondary">
              <Receipt size={16} /> Record Expense
            </button>
          </div>
        )}
      </div>

      {/* Cost Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Total Operating Cost"
          value={costSummary ? `$${costSummary.totalOperationalCost.toLocaleString()}` : '—'}
          subtitle="Fuel + Maintenance + Tolls"
          icon={DollarSign}
        />

        <MetricCard
          title="Total Fuel Expenditure"
          value={costSummary ? `$${costSummary.fuelCost.toLocaleString()}` : '—'}
          subtitle="Direct diesel outlays"
          icon={Fuel}
        />

        <MetricCard
          title="Maintenance Expenditure"
          value={costSummary ? `$${costSummary.maintenanceCost.toLocaleString()}` : '—'}
          subtitle="Workshop repairs & parts"
          icon={Receipt}
        />

        <MetricCard
          title="Avg Fleet Fuel Efficiency"
          value={costSummary ? `${costSummary.averageFleetFuelEfficiency} km/L` : '—'}
          subtitle="Baseline standard: > 3.0 km/L"
          icon={TrendingDown}
          trend={{ value: 'Fleet Target Met', isPositive: true }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveTab('fuel')}
          style={{
            padding: '0.65rem 1.15rem',
            fontWeight: activeTab === 'fuel' ? 700 : 500,
            fontSize: '0.85rem',
            color: activeTab === 'fuel' ? 'var(--color-olive-900)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'fuel' ? '3px solid var(--color-olive-700)' : '3px solid transparent',
          }}
        >
          Fuel Refill Logs ({fuelLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '0.65rem 1.15rem',
            fontWeight: activeTab === 'expenses' ? 700 : 500,
            fontSize: '0.85rem',
            color: activeTab === 'expenses' ? 'var(--color-olive-900)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'expenses' ? '3px solid var(--color-olive-700)' : '3px solid transparent',
          }}
        >
          Operating Expenses & Tolls ({expenses.length})
        </button>
      </div>

      {/* Tab 1: Fuel Logs */}
      {activeTab === 'fuel' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Fuel Dispenser Telemetry & Consumption Audits</div>
              <div className="card-subtitle">
                Automated detector flags vehicles consuming &gt;15% above fleet baseline (distance / fuel)
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Liters</th>
                  <th>Cost / L</th>
                  <th>Total Cost</th>
                  <th>Trip Distance</th>
                  <th>Fuel Efficiency</th>
                  <th>Status Flag</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-olive-700)' }}>{log.vehicleReg}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.stationName}</div>
                    </td>
                    <td>{log.date}</td>
                    <td style={{ fontWeight: 600 }}>{log.liters} L</td>
                    <td>${log.costPerLiter.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>${log.totalCost.toFixed(2)}</td>
                    <td>{log.distanceSinceLastFill} km</td>
                    <td>
                      <span style={{ fontWeight: 700, color: log.isAbnormalConsumption ? 'var(--status-critical-text)' : 'var(--text-primary)' }}>
                        {log.fuelEfficiencyKmPerL} km/L
                      </span>
                    </td>
                    <td>
                      {log.isAbnormalConsumption ? (
                        <Badge variant="critical">Abnormal Consumption</Badge>
                      ) : (
                        <Badge variant="available">Nominal</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses */}
      {activeTab === 'expenses' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Operating Expense Ledger</div>
              <div className="card-subtitle">Tolls, road tax, driver allowances, and permits</div>
            </div>
          </div>

          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Receipt #</th>
                  <th>Date</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>
                      <Badge variant="olive">{exp.category}</Badge>
                    </td>
                    <td style={{ fontWeight: 600 }}>{exp.description}</td>
                    <td>{exp.vehicleReg || 'Fleet-wide'}</td>
                    <td style={{ fontWeight: 700 }}>${exp.amount.toFixed(2)}</td>
                    <td style={{ fontFeatureSettings: '"tnum"', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {exp.receiptNumber || '—'}
                    </td>
                    <td>{exp.date}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      <Modal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        title="Log Fuel Intake"
        subtitle="Records fuel quantity and computes real-time efficiency"
      >
        <form onSubmit={handleLogFuel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Vehicle *</label>
            <select
              className="form-control"
              required
              value={fuelForm.vehicleId}
              onChange={e => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.model}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Liters Filled *</label>
              <input
                type="number"
                step="0.1"
                min={1}
                required
                className="form-control"
                value={fuelForm.liters}
                onChange={e => setFuelForm({ ...fuelForm, liters: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Per Liter ($) *</label>
              <input
                type="number"
                step="0.01"
                min={0.1}
                required
                className="form-control"
                value={fuelForm.costPerLiter}
                onChange={e => setFuelForm({ ...fuelForm, costPerLiter: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Distance Driven Since Last Fill (km) *</label>
            <input
              type="number"
              min={1}
              required
              className="form-control"
              value={fuelForm.distanceSinceLastFill}
              onChange={e => setFuelForm({ ...fuelForm, distanceSinceLastFill: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fuel Station & Location</label>
            <input
              type="text"
              className="form-control"
              value={fuelForm.stationName}
              onChange={e => setFuelForm({ ...fuelForm, stationName: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsFuelModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Fuel Intake
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Operating Expense"
        subtitle="Book tolls, permits, or operational expenses"
      >
        <form onSubmit={handleLogExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expense Category</label>
              <select
                className="form-control"
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
              >
                <option value="Toll">Toll</option>
                <option value="Permit & Licensing">Permit & Licensing</option>
                <option value="Driver Allowance">Driver Allowance</option>
                <option value="Insurance">Insurance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min={0.5}
                required
                className="form-control"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Related Vehicle</label>
            <select
              className="form-control"
              value={expenseForm.vehicleId}
              onChange={e => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
            >
              <option value="">General Fleet Expense (No specific vehicle)</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} — {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Turnpike toll pass"
              value={expenseForm.description}
              onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Book Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
