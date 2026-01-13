import { STORAGE_KEYS } from "../config/constants.js";

export default class Storage {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Storage: Erro ao salvar dados com chave "${key}":`, error);
    }
  }

  static load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        `Storage: Erro ao carregar dados com chave "${key}":`,
        error
      );
      return null;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `Storage: Erro ao remover dados com chave "${key}":`,
        error
      );
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage: Erro ao limpar localStorage:", error);
    }
  }

  static exists(key) {
    return localStorage.getItem(key) !== null;
  }

  // Carrega array de top rockets (retorna array vazio se não existir)
  static loadTopRockets() {
    const data = Storage.load(STORAGE_KEYS.TOP_ROCKETS);
    return data || [null, null, null];
  }

  // Salva array completo de top rockets
  static saveTopRockets(topRockets) {
    Storage.save(STORAGE_KEYS.TOP_ROCKETS, topRockets);
  }


  static updateTopRockets(newRockets) {
    const topRockets = Storage.loadTopRockets();
    let updated = false;

    for (const newRocket of newRockets) {
      let insertPosition = -1;

      for (let i = 0; i < topRockets.length; i++) {
        const existing = topRockets[i];
        if (!existing || newRocket.orbits > existing.orbits) {
          insertPosition = i;
          break;
        }
      }

      if (insertPosition !== -1) {
        for (let i = topRockets.length - 1; i > insertPosition; i--) {
          topRockets[i] = topRockets[i - 1];
        }
        topRockets[insertPosition] = newRocket;
        console.log(
          `🏆 Top ${insertPosition + 1} atualizado! Orbits: ${newRocket.orbits}`
        );
        updated = true;
      }
    }

    if (updated) {
      Storage.saveTopRockets(topRockets);
    }

    return updated;
  }

  static selectRandomTopRocket(weights) {
    const topRockets = Storage.loadTopRockets();
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative && topRockets[i]) {
        return topRockets[i];
      }
    }
    for (const rocket of topRockets) {
      if (rocket) return rocket;
    }

    return null;
  }
}
