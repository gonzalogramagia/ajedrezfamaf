// Sistema de detalles del torneo
class TournamentDetailSystem {
  constructor() {
    this.container = document.getElementById('tournament-detail-app');
    this.tournamentCode = this.container?.dataset.tournamentCode;
    this.init();
  }

  async init() {
    if (!this.container || !this.tournamentCode) return;
    
    try {
      await this.loadTournamentData();
    } catch (error) {
      console.error('Error cargando datos del torneo:', error);
      this.showError('Error al cargar la información del torneo');
    }
  }

  async loadTournamentData() {
    // Datos mock para el torneo
    const tournamentData = {
      id: this.tournamentCode,
      nombre: 'Torneo de Ajedrez Septiembre 2024',
      descripcion: 'Torneo oficial de ajedrez organizado por Ajedrez FAMAF. Sistema suizo con 5 rondas.',
      maxJugadores: 32,
      jugadoresInscritos: 18,
      sistema: 'Suizo',
      tiempoPorJugador: 15,
      incremento: 10,
      fechaInicio: '2024-09-28T10:00:00',
      ubicacion: 'FAMAF - Ciudad Universitaria',
      premios: [
        '1er lugar: $5000 + trofeo',
        '2do lugar: $3000 + medalla',
        '3er lugar: $2000 + medalla',
        '4to-6to lugar: $1000 cada uno'
      ],
      costoInscripcion: 2000,
      estado: 'upcoming',
      codigoDescuento: 'FAMAF',
      descuento: 50
    };

    this.renderTournamentDetail(tournamentData);
  }

  renderTournamentDetail(tournament) {
    const isUpcoming = tournament.estado === 'upcoming';
    const isActive = tournament.estado === 'active';
    const isCompleted = tournament.estado === 'completed';
    const isCancelled = tournament.estado === 'cancelled';

    const estadoClass = {
      upcoming: 'status-upcoming',
      active: 'status-active', 
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    }[tournament.estado];

    const estadoText = {
      upcoming: 'Próximamente',
      active: 'En curso',
      completed: 'Finalizado',
      cancelled: 'Cancelado'
    }[tournament.estado];

    const fechaFormateada = new Date(tournament.fechaInicio).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const precioFinal = tournament.costoInscripcion - (tournament.costoInscripcion * tournament.descuento / 100);

    this.container.innerHTML = `
      <div class="tournament-detail">
        <!-- Header con estado -->
        <div class="tournament-header">
          <div class="tournament-status">
            <span class="status-pill ${estadoClass}">${estadoText}</span>
          </div>
          <h1 class="tournament-title">${tournament.nombre}</h1>
          <p class="tournament-subtitle">${tournament.descripcion}</p>
        </div>

        <!-- Información principal -->
        <div class="tournament-info-grid">
          <div class="info-card">
            <div class="info-icon">📅</div>
            <div class="info-content">
              <h3>Fecha y Hora</h3>
              <p>${fechaFormateada}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">📍</div>
            <div class="info-content">
              <h3>Ubicación</h3>
              <p>${tournament.ubicacion}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">👥</div>
            <div class="info-content">
              <h3>Participantes</h3>
              <p>${tournament.jugadoresInscritos} / ${tournament.maxJugadores}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">⚡</div>
            <div class="info-content">
              <h3>Sistema de Juego</h3>
              <p>${tournament.sistema}</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">⏱️</div>
            <div class="info-content">
              <h3>Tiempo por Jugador</h3>
              <p>${tournament.tiempoPorJugador} min + ${tournament.incremento} seg</p>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">💰</div>
            <div class="info-content">
              <h3>Inscripción</h3>
              <p class="price-info">
                <span class="original-price">$${tournament.costoInscripcion}</span>
                ${tournament.descuento > 0 ? `
                  <span class="discount-price">$${precioFinal}</span>
                  <span class="discount-badge">-${tournament.descuento}%</span>
                ` : ''}
              </p>
            </div>
          </div>
        </div>

        <!-- Premios -->
        <div class="prizes-section">
          <h2>🏆 Premios</h2>
          <ul class="prizes-list">
            ${tournament.premios.map(premio => `<li>${premio}</li>`).join('')}
          </ul>
        </div>

        <!-- Descuento especial -->
        ${tournament.codigoDescuento ? `
          <div class="discount-section">
            <h2>🎟️ Código de Descuento</h2>
            <div class="discount-code">
              <span class="code">${tournament.codigoDescuento}</span>
              <span class="discount-percent">-${tournament.descuento}%</span>
            </div>
            <p class="discount-description">Usa este código en el formulario de inscripción</p>
          </div>
        ` : ''}

        <!-- Botón de inscripción -->
        ${isUpcoming ? `
          <div class="registration-section">
            <a href="/torneo?torneo=${tournament.id}" class="register-button">
              Inscribirse al Torneo
            </a>
            <p class="registration-note">
              Cupos disponibles: ${tournament.maxJugadores - tournament.jugadoresInscritos}
            </p>
          </div>
        ` : ''}

        ${isActive ? `
          <div class="active-tournament-info">
            <h2>🏁 Torneo en Curso</h2>
            <p>El torneo está actualmente en desarrollo. Los resultados se publicarán al finalizar.</p>
          </div>
        ` : ''}

        ${isCompleted ? `
          <div class="completed-tournament-info">
            <h2>✅ Torneo Finalizado</h2>
            <p>Este torneo ha concluido. ¡Gracias a todos los participantes!</p>
          </div>
        ` : ''}

        ${isCancelled ? `
          <div class="cancelled-tournament-info">
            <h2>❌ Torneo Cancelado</h2>
            <p>Este torneo ha sido cancelado. Disculpas por las molestias.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="/torneo" class="back-button">Volver a Torneos</a>
      </div>
    `;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new TournamentDetailSystem();
});
