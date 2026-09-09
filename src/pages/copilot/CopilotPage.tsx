import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  ExternalLink,
  Bot,
  User,
  CheckCircle
} from 'lucide-react';
import { copilotService } from '../../api/copilotService';
import { CopilotQueryIntent, CopilotQueryResult, CopilotMessage } from '../../types/copilot';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CopilotPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Greetings. I am the TransitOps Operational Copilot. You can query approved analytical intents below without writing raw SQL.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedQueries: { label: string; intent: CopilotQueryIntent; desc: string; icon: any }[] = [
    {
      label: 'Highest ROI Transport Unit',
      intent: 'highest_roi_vehicle',
      desc: 'Identifies top asset ranked by net operating yield over acquisition cost',
      icon: TrendingUp,
    },
    {
      label: 'Drivers with Expiring Commercial Licenses',
      intent: 'expiring_licenses',
      desc: 'Lists drivers with <30 days remaining on CDL credentials',
      icon: Users,
    },
    {
      label: 'Vehicles Locked In Maintenance Shop',
      intent: 'vehicles_in_maintenance',
      desc: 'Displays assets quarantined from the dispatch pool for repairs',
      icon: Wrench,
    },
  ];

  const handleRunIntent = async (intent: CopilotQueryIntent, promptLabel: string) => {
    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const result = await copilotService.executeIntent(intent);
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: result.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resultData: result,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Query Failed', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const lower = inputText.toLowerCase();
    let matchedIntent: CopilotQueryIntent = 'highest_roi_vehicle';

    if (lower.includes('license') || lower.includes('driver') || lower.includes('expire')) {
      matchedIntent = 'expiring_licenses';
    } else if (lower.includes('maintenance') || lower.includes('shop') || lower.includes('repair')) {
      matchedIntent = 'vehicles_in_maintenance';
    }

    const queryText = inputText;
    setInputText('');
    handleRunIntent(matchedIntent, queryText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-700)',
              color: 'var(--color-beige-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Operational Copilot</h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Strictly secured query engine. Parameterized intent-allowlist architecture prevents arbitrary client SQL injection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Chat Stream */}
        <div
          className="card"
          style={{
            gridColumn: 'span 8',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-olive-600)' : 'var(--bg-surface-hover)',
                    color: msg.sender === 'user' ? '#FFF' : 'var(--color-olive-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
                </div>

                <div
                  style={{
                    maxWidth: '75%',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-olive-700)' : 'var(--bg-surface-hover)',
                    color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  <div>{msg.text}</div>

                  {/* Render Structured Result Card if available */}
                  {msg.resultData && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.85rem',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        {msg.resultData.title}
                      </div>

                      {msg.resultData.data.length > 0 && (
                        <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                          {msg.resultData.data.map((item: any, idx: number) => (
                            <div key={idx} style={{ padding: '0.35rem 0.5rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '4px' }}>
                              {Object.entries(item).map(([k, v]) => (
                                <span key={k} style={{ marginRight: '0.85rem' }}>
                                  <strong style={{ textTransform: 'capitalize' }}>{k}:</strong> {String(v)}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.resultData.suggestedAction && (
                        <NavLink
                          to={msg.resultData.suggestedAction.path}
                          className="btn btn-secondary"
                          style={{ marginTop: '0.65rem', fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'inline-flex', gap: '0.35rem' }}
                        >
                          {msg.resultData.suggestedAction.label} <ExternalLink size={13} />
                        </NavLink>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.68rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Bar */}
          <form
            onSubmit={handleCustomSubmit}
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              gap: '0.65rem',
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask an operational query (e.g. 'Show top ROI vehicles', 'Check expiring licenses')..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isProcessing}
            />
            <button type="submit" className="btn btn-primary" disabled={isProcessing || !inputText.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Allowlisted Intent Cards */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-olive-700)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <ShieldCheck size={16} /> Authorized Operational Intents
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Click any verified intent to instantly execute safe queries:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {predefinedQueries.map(q => {
                const Icon = q.icon;
                return (
                  <div
                    key={q.intent}
                    onClick={() => handleRunIntent(q.intent, q.label)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <Icon size={16} color="var(--color-olive-600)" />
                      <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{q.label}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {q.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
