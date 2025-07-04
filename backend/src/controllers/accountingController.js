import Round from '../models/Round.js';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const getDailyStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const dailyRounds = await Round.find({
      isPaid: true,
      paidAt: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    }).populate('products.product');

    // Calcular el total correctamente usando los precios de los productos
    const total = dailyRounds.reduce((sum, round) => {
      const roundTotal = round.products.reduce((roundSum, item) => {
        return roundSum + (item.price || 0) * item.quantity;
      }, 0);
      return sum + roundTotal;
    }, 0);

    const roundCount = dailyRounds.length;

    res.status(200).json({
      total,
      roundCount,
      date: today
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetDailyStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Actualizar todas las rondas pagadas hoy para marcarlas como "archivadas"
    await Round.updateMany(
      {
        isPaid: true,
        paidAt: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      },
      {
        $set: { archived: true }
      }
    );

    res.status(200).json({ message: 'Estadísticas diarias reiniciadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    let startDate, endDate;

    if (month && year) {
      startDate = startOfMonth(new Date(year, month - 1));
      endDate = endOfMonth(new Date(year, month - 1));
    } else {
      // Si no se especifica mes y año, devolver el mes actual
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    }

    const monthlyRounds = await Round.find({
      isPaid: true,
      paidAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('products.product');

    // Calcular el total correctamente sumando los productos de cada ronda
    const total = monthlyRounds.reduce((sum, round) => {
      const roundTotal = round.products.reduce((roundSum, item) => {
        return roundSum + (item.price || 0) * item.quantity;
      }, 0);
      return sum + roundTotal;
    }, 0);
    const roundCount = monthlyRounds.length;

    // Agrupar por día
    const dailyStats = monthlyRounds.reduce((acc, round) => {
      const day = round.paidAt.getDate();
      if (!acc[day]) {
        acc[day] = {
          date: round.paidAt,
          total: 0,
          roundCount: 0
        };
      }
      // Sumar los productos de la ronda
      const roundTotal = round.products.reduce((roundSum, item) => {
        return roundSum + (item.price || 0) * item.quantity;
      }, 0);
      acc[day].total += roundTotal;
      acc[day].roundCount += 1;
      return acc;
    }, {});

    // Convertir el objeto a array y ordenar por fecha
    const dailyStatsArray = Object.values(dailyStats).sort((a, b) => a.date - b.date);

    res.status(200).json({
      total,
      roundCount,
      dailyStats: dailyStatsArray,
      rounds: monthlyRounds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPreviousMonths = async (req, res) => {
  try {
    const months = [];
    const currentDate = new Date();

    // Obtener los últimos 3 meses
    for (let i = 0; i < 3; i++) {
      const date = subMonths(currentDate, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const monthlyRounds = await Round.find({
        isPaid: true,
        paidAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).populate('products.product');

      // Calcular el total correctamente sumando los productos de cada ronda
      const total = monthlyRounds.reduce((sum, round) => {
        const roundTotal = round.products.reduce((roundSum, item) => {
          return roundSum + (item.price || 0) * item.quantity;
        }, 0);
        return sum + roundTotal;
      }, 0);

      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        total,
        roundCount: monthlyRounds.length
      });
    }

    res.status(200).json(months);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 