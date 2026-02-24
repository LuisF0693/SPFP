import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section style={{ padding: '80px 20px', background: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: '#111418' }}>
            Você se identifica com alguma dessas situações?
          </h2>
          <p style={{ fontSize: '18px', color: '#637588' }}>
            Se sua resposta foi sim para qualquer uma, você não está sozinho
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>💸</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Dinheiro Sumindo</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Trabalha muito mas nunca sabe onde foi o dinheiro</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Planilha Caótica</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Começou uma planilha mas parou na 2ª semana</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>😰</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Medo de Investir</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Quer investir mas não sabe por onde começar</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Sem Metas</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Tem sonhos mas não sabe quanto precisa guardar</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>💳</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Dívidas Ocultas</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Parcelas espalhadas e não sabe o total real</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e6e8eb', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🕐</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>Falta de Tempo</h3>
            <p style={{ fontSize: '14px', color: '#637588' }}>Quer organizar mas nunca tem tempo pra isso</p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#111418' }}>
            É exatamente pra isso que o SPFP existe
          </p>
          <p style={{ fontWeight: 'bold', color: '#135bec', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Descubra como →
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
