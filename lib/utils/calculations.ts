/**
 * Calcula las metas diarias de agua y calorías basándose en parámetros biométricos.
 * Utiliza la ecuación de Mifflin-St Jeor para el BMR.
 */
export function calculateDailyGoals(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  primaryGoal: string;
  activityMinutes?: number;
}) {
  const { weightKg, heightCm, age, gender, primaryGoal, activityMinutes = 45 } = params;

  // 1. Cálculo de TMB (Tasa Metabólica Basal) - Mifflin-St Jeor
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Factor de Actividad (Estimado por minutos de actividad diaria)
  // Sedentario: 1.2, Ligero: 1.375, Moderado: 1.55, Muy Activo: 1.725
  let activityFactor = 1.2;
  if (activityMinutes >= 60) activityFactor = 1.55;
  else if (activityMinutes >= 30) activityFactor = 1.375;
  else if (activityMinutes >= 15) activityFactor = 1.2;

  let calories = bmr * activityFactor;

  // 3. Ajuste por Objetivo
  // lose_weight: -500 kcal (déficit)
  // build_muscle: +300 kcal (superávit ligero)
  // active / endurance: mantenimiento
  if (primaryGoal === 'lose_weight') {
    calories -= 500;
  } else if (primaryGoal === 'build_muscle') {
    calories += 300;
  }

  // 4. Cálculo de Agua (Fórmula estándar: 35ml por kg)
  const waterMl = weightKg * 35;

  // Asegurar límites razonables
  return {
    calories: Math.max(1200, Math.round(calories)), // No menos de 1200 kcal por salud
    waterMl: Math.max(1500, Math.round(waterMl)),   // No menos de 1.5L
    activityMinutes: activityMinutes
  };
}

/**
 * Calcula la distribución de macronutrientes basada en la dieta.
 */
export function calculateMacros(calories: number, dietType: string) {
  let p = 0.20, c = 0.50, f = 0.30; // Omnívoro por defecto

  switch (dietType) {
    case 'keto':
      p = 0.25; c = 0.05; f = 0.70;
      break;
    case 'paleo':
      p = 0.30; c = 0.30; f = 0.40;
      break;
    case 'vegan':
    case 'vegetarian':
      p = 0.15; c = 0.60; f = 0.25;
      break;
  }

  return {
    proteinG: Math.round((calories * p) / 4),
    carbsG: Math.round((calories * c) / 4),
    fatG: Math.round((calories * f) / 9)
  };
}
