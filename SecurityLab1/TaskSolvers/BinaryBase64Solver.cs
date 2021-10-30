using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SecurityLab1.Interfaces;

namespace SecurityLab1.TaskSolvers
{
    public class BinaryBase64Solver : ITaskSolver
    {
        private const int SymbolLength = 8; 
        public async Task SolveTask(string filepath)
        {
            var text = await File.ReadAllTextAsync(filepath);
            var base64Text = ReadBinaryText(text);
            var decodedBytes = Convert.FromBase64String(base64Text);
            await using var file = new StreamWriter("result.txt", false, Encoding.UTF8);
            await file.WriteLineAsync(Encoding.Default.GetString(decodedBytes));
        }

        private string ReadBinaryText(string text)
        {
            var result = new StringBuilder();
            var currentSymbol = new List<char>();

            foreach (var ch in text)
            {
                currentSymbol.Add(ch);
                if (currentSymbol.Count == SymbolLength)
                {
                    var binaryString = currentSymbol.Aggregate("", (x, y) => x + y);
                    var asciiChar = Convert.ToInt32(binaryString, 2);
                    result.Append((char) asciiChar);
                    currentSymbol.Clear();
                }
            }

            return result.ToString();
        }
    }
}