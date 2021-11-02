using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            var sortedIndexes = coincidenceIndexes.OrderByDescending(x => x.Value);
            // foreach (var pair in sortedIndexes)
            // {
            //     Console.WriteLine(pair.Key + " " + pair.Value);
            // }
            var keys = GetKeys(coincidenceIndexes);
            var key = keys.First();
           
        }

        private Dictionary<int, double> CalculateIndexOfCoincidence(byte[] text)
        {
            var buffer = new List<byte>();
            buffer.AddRange(text);
            var result = new Dictionary<int, double>();
            var coincidenceCount = 0d;
            for (int i = 0; i < text.Length; i++)
            {
                var ch = buffer.Last();
                buffer.RemoveAt(buffer.Count - 1);
                buffer.Insert(0, ch);
                for (int j = 0; j < text.Length - 1; j++)
                {
                    if (text[j] == buffer[j])
                    {
                        coincidenceCount++;
                    }
                }
                result.Add(i + 1, coincidenceCount / text.Length);
                coincidenceCount = 0d;
            }
            // for (int i = 1; i < textString.Length; i++)
            // {
            //     for (int j = 0; j < textString.Length - i; j++)
            //     {
            //         if (textString[j] == textString[j + i])
            //         {
            //             coincidenceCount++;
            //         }
            //     }
            //     result.Add(i, coincidenceCount / text.Length);
            //     coincidenceCount = 0d;
            // }

            return result;
        }

        private List<int> GetKeys(Dictionary<int, double> coincidences)
        {
            var total = 0d;
            var result = new List<int>();
            foreach (var coincidence in coincidences)
            {
                for (int i = 1; i < coincidences.Count; i++)
                {
                    if (i % coincidence.Key == 0)
                    {
                        total += coincidence.Value;
                    }
                }
                
                var average = total / ((double)coincidences.Count / coincidence.Key);
                if (average >= 0.06)
                {
                    result.Add(coincidence.Key);
                }

                total = 0d;
            }

            return result;
        }
    }
}