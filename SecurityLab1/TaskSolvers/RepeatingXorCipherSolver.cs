using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using SecurityLab1.Interfaces;

namespace SecurityLab1.TaskSolvers
{
    public class RepeatingXorCipherSolver : ITaskSolver
    {
        public async Task SolveTask(string filepath)
        {
            var text = await File.ReadAllTextAsync(filepath);
            var encodedText = Convert.FromBase64String(text);
            var coincidenceIndexes = CalculateIndexOfCoincidence(encodedText);
            foreach (var pair in coincidenceIndexes)
            {
                Console.WriteLine(pair.Key + " " + pair.Value);
            }
        }

        private Dictionary<int, double> CalculateIndexOfCoincidence(byte[] text)
        {
            var result = new Dictionary<int, double>();
            var coincidenceCount = 0d;
            var textString = Encoding.UTF8.GetString(text);
            for (int i = 1; i < textString.Length; i++)
            {
                for (int j = 0; j < textString.Length - i; j++)
                {
                    if (textString[j] == textString[j + i])
                    {
                        coincidenceCount++;
                    }
                }
                result.Add(i, coincidenceCount / text.Length);
                coincidenceCount = 0d;
            }

            return result;
        }
    }
}