export interface Question {
  num1: number;
  num2: number;
  answer: number;
}

export interface PlayerStats {
  correct: number;
  incorrect: number;
  totalTime: number;
  questionsAnswered: number[];
  answersGiven: number[];
  correctAnswers: number[];
}

export type Difficulty = '1-digit' | '1x2-digit' | '2-digit' | '2x3-digit' | '3-digit';

export function generateQuestion(difficulty: Difficulty = '2-digit'): Question {
  let num1: number, num2: number;
  switch (difficulty) {
    case '1-digit':
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
      break;
    case '1x2-digit':
      if (Math.random() > 0.5) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 90) + 10;
      } else {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 9) + 1;
      }
      break;
    case '2-digit':
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
      break;
    case '2x3-digit':
      if (Math.random() > 0.5) {
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 900) + 100;
      } else {
        num1 = Math.floor(Math.random() * 900) + 100;
        num2 = Math.floor(Math.random() * 90) + 10;
      }
      break;
    case '3-digit':
      num1 = Math.floor(Math.random() * 900) + 100;
      num2 = Math.floor(Math.random() * 900) + 100;
      break;
    default:
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
  }
  return { num1, num2, answer: num1 + num2 };
}

export function generateMultipleChoice(correctAnswer: number): number[] {
  const choices = new Set<number>([correctAnswer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 40) - 20;
    const wrong = correctAnswer + (offset === 0 ? (Math.random() > 0.5 ? 1 : -1) : offset);
    if (wrong > 0 && wrong !== correctAnswer) {
      choices.add(wrong);
    }
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getAdvice(stats: PlayerStats): string[] {
  const advice: string[] = [];
  const percentage = calculatePercentage(stats.correct, stats.questionsAnswered.length);

  if (percentage >= 90) {
    advice.push("🌟 Amazing work! You're an addition superstar!");
    advice.push("🚀 Try mixing 2-digit and 3-digit numbers to challenge yourself even more!");
  } else if (percentage >= 70) {
    advice.push("👏 Great job! You're getting really good at addition!");
    advice.push("📝 Practice carrying over when the ones column adds up to 10 or more.");
  } else if (percentage >= 50) {
    advice.push("💪 Good effort! Keep practicing and you'll get even better!");
    advice.push("🎯 Focus on adding the ones column first, then the tens, then hundreds.");
    advice.push("💡 Try breaking numbers apart: 47 + 35 = 47 + 30 + 5 = 82");
  } else {
    advice.push("🌱 Don't give up! Practice makes perfect!");
    advice.push("📚 Try practicing with smaller 2-digit numbers first.");
    advice.push("🎵 Count up from the bigger number to help you add!");
    advice.push("✏️ Use your fingers or draw dots to help you count!");
  }

  return advice;
}

export type GameMode = 'landing' | 'two-player' | 'one-player' | 'lightning' | 'infinity' | 'tug-of-war';
