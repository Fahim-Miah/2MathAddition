export function generateAdditionQuestion(): { a: number; b: number; answer: number } {
  const isThreeDigit = Math.random() > 0.5;
  let a: number, b: number;
  
  if (isThreeDigit) {
    a = Math.floor(Math.random() * 900) + 100; // 100-999
    b = Math.floor(Math.random() * 900) + 100; // 100-999
  } else {
    a = Math.floor(Math.random() * 90) + 10; // 10-99
    b = Math.floor(Math.random() * 90) + 10; // 10-99
  }
  
  return { a, b, answer: a + b };
}

export function generateMultipleChoice(correctAnswer: number): number[] {
  const choices = new Set<number>([correctAnswer]);
  
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrong = correctAnswer + (offset === 0 ? 1 : offset);
    if (wrong > 0 && wrong !== correctAnswer) {
      choices.add(wrong);
    }
  }
  
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function getAdvice(correctCount: number, totalCount: number, avgTime?: number): string[] {
  const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  const advice: string[] = [];
  
  if (percentage >= 90) {
    advice.push("🌟 Amazing work! You're a math superstar!");
    advice.push("Try practicing with 3-digit numbers to challenge yourself even more!");
  } else if (percentage >= 70) {
    advice.push("👍 Great job! You're getting really good at addition!");
    advice.push("Practice carrying over when adding ones and tens columns.");
  } else if (percentage >= 50) {
    advice.push("💪 Good effort! Keep practicing and you'll get even better!");
    advice.push("Try breaking numbers apart: 47 + 35 = 47 + 30 + 5");
    advice.push("Remember to check your work by adding the columns one at a time.");
  } else {
    advice.push("📚 Don't worry! Everyone learns at their own pace!");
    advice.push("Start with 2-digit numbers and work your way up.");
    advice.push("Use your fingers or draw dots to help you count!");
    advice.push("Try adding the ones column first, then the tens column.");
  }
  
  if (avgTime && avgTime > 15) {
    advice.push("⏰ Take your time to think about each problem carefully.");
  } else if (avgTime && avgTime < 5) {
    advice.push("⚡ You're super fast! Make sure to double-check your answers!");
  }
  
  return advice;
}
