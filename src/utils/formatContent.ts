interface FormattedContent {
  title: string;
  theory: string;
  questions: Array<{
    question: string;
    type: 'multiple_choice' | 'fill_blank' | 'essay';
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

export const formatContent = (content: string): FormattedContent => {
  // Split content into sections
  const sections = content.split('\n\n');
  
  // Parse the content
  const title = sections[0]?.replace('Title:', '').trim() || '';
  
  // Find theory section and combine all theory content
  let theoryContent = '';
  let foundTheory = false;
  let foundQuestions = false;

  for (const section of sections) {
    if (section.trim().startsWith('Theory:')) {
      foundTheory = true;
      continue;
    }
    if (section.trim().startsWith('Q:')) {
      foundQuestions = true;
      break;
    }
    if (foundTheory && !foundQuestions) {
      theoryContent += section + '\n\n';
    }
  }

  const theory = theoryContent ? theoryContent.trim() : '';

  // Format questions
  const formatQuestions = (text: string): FormattedContent['questions'] => {
    const questions = text.split('\n\n').filter(q => q.trim().startsWith('Q:'));
    return questions.map(q => {
      const lines = q.split('\n');
      const question = lines[0].replace('Q:', '').trim();
      const type = lines[1]?.includes('multiple_choice') ? 'multiple_choice' :
                  lines[1]?.includes('fill_blank') ? 'fill_blank' : 'essay';
      
      let options: string[] | undefined;
      if (type === 'multiple_choice') {
        options = lines
          .filter(l => l.trim().startsWith('*'))
          .map(o => o.replace('*', '').trim());
      }

      const correctAnswer = lines.find(l => l.includes('Correct Answer:'))?.split(':')[1]?.trim() || '';
      const explanation = lines.find(l => l.includes('Explanation:'))?.split(':')[1]?.trim() || '';

      return {
        question,
        type,
        options,
        correctAnswer,
        explanation
      };
    });
  };

  // Get remaining sections for questions
  const questionSections = sections.filter(section => section.trim().startsWith('Q:'));
  const questions = formatQuestions(questionSections.join('\n\n'));

  return {
    title,
    theory,
    questions
  };
}; 