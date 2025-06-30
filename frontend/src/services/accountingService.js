const API_URL = 'https://camarerio.onrender.com/api';

export const getDailyStats = async () => {
  try {
    const response = await fetch(`${API_URL}/accounting/daily`);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas diarias');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getDailyStats:', error);
    throw error;
  }
};

export const getMonthlyStats = async (month, year) => {
  try {
    const url = new URL(`${API_URL}/accounting/monthly`);
    if (month && year) {
      url.searchParams.append('month', month);
      url.searchParams.append('year', year);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas mensuales');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getMonthlyStats:', error);
    throw error;
  }
};

export const getPreviousMonths = async () => {
  try {
    const response = await fetch(`${API_URL}/accounting/previous-months`);
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de meses anteriores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getPreviousMonths:', error);
    throw error;
  }
}; 