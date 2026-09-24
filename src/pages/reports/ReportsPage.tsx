import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  IndianRupee,
  Percent,
  Truck,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { analyticsService } from '../../api/analyticsService';
import { VehicleRoiRanking, DashboardKPIs } from '../../types/analytics';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { can } = useAuth();
  const { showToast } = useToast();

  const [rankings, setRankings] = useState<VehicleRoiRanking[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [rankData, kpiData] = await Promise.all([
          analyticsService.getVehicleRoiRankings(),
          analyticsService.getDashboardKPIs(),
        ]);
        setRankings(rankData);
        setKpis(kpiData);
      } catch (err: any) {
        showToast({ type: 'error', title: 'Load Error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [showToast]);

  const handleExportCsv = () => {
    if (!can('canExportReports')) {
      showToast({ type: 'error', title: 'Permission Denied', message: 'Current role lacks report export authorization.' });
      return;
    }
    analyticsService.exportCsv(rankings, `TransitOps_ROI_Report_${dateRange}`);
    showToast({ type: 'success', title: 'Report Exported', message: 'Vehicle ROI dataset downloaded as CSV.' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Financial Intelligence & Asset ROI</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Capital asset yields, operational margin ratios, fleet utilization, and exportable financial ledgers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-control"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter (90d)</option>
            <option value="1y">Trailing 12 Months</option>
          </select>

          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={15} /> Print View
          </button>

          <button onClick={handleExportCsv} className="btn btn-primary" disabled={!can('canExportReports')}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ROI Methodology Alert Banner */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--color-olive-50)',
          borderColor: 'var(--color-olive-300)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-olive-700)',
            color: 'var(--color-beige-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TrendingUp size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            Authoritative TransitOps ROI Computation Rule
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-olive-800)', marginTop: '0.15rem' }}>
            Formula: <code>(Gross Transport Revenue − (Maintenance Cost + Fuel Outlay)) ÷ Capital Acquisition Cost</code>.
            Zero acquisition cost units safely output <code>N/A</code> to prevent division-by-zero anomalies.
          </div>
        </div>
      </div>

      {/* ROI Asset Rankings Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Asset Return on Investment (ROI) Leaderboard</div>
            <div className="card-subtitle">
              Ranked from highest capital yield to lowest performing transport asset
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Registration</th>
                <th>Make & Model</th>
                <th>Classification</th>
                <th>Gross Revenue</th>
                <th>Operating Expenses</th>
                <th>Net Margin</th>
                <th>Acquisition Cost</th>
                <th>Calculated ROI</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map(item => {
                const netMargin = item.revenue - item.totalCost;
                return (
                  <tr key={item.vehicleId}>
                    <td>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: item.rank === 1 ? 'var(--color-olive-700)' : 'var(--bg-surface-hover)',
                          color: item.rank === 1 ? 'var(--color-beige-100)' : 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                        }}
                      >
                        #{item.rank}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-olive-700)' }}>
                        {item.registrationNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.model}</td>
                    <td>{item.type}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-olive-700)' }}>
                      {formatINR(item.revenue)}
                    </td>
                    <td style={{ color: 'var(--status-critical-text)' }}>
                      {formatINR(item.totalCost)}
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatINR(netMargin)}</td>
                    <td>{formatINR(item.acquisitionCost)}</td>
                    <td>
                      {item.roiPercentage !== null ? (
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: item.roiPercentage > 20 ? 'var(--color-olive-700)' : '#C47828',
                          }}
                        >
                          {item.roiPercentage}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
