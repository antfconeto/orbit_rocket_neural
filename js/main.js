

import Simulation from './simulation/Simulation.js';


function main() {
    const canvas = document.getElementById('screen');
    
    if (!canvas) {
        console.error('Elemento canvas não encontrado!');
        return;
    }

    const simulation = new Simulation(canvas);
    simulation.init();
    

    simulation.start();
    

    window.simulation = simulation;
    
    console.log('🚀 Simulação iniciada!');
    console.log('📊 Acesse window.simulation para ver estatísticas');
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
