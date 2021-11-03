﻿using System;
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
            var keys = GetKeys(coincidenceIndexes);
            var key = keys.First();
            var groupedStrings = new Dictionary<int, List<string>>();

            var prikol = GetGroupedBytes(encodedText, key);

            for (int i = 0; i < prikol.Count; i++)
            {
                groupedStrings.Add(i + 1, FrequencyAnalysis(prikol[i].ToArray()));
            }
            
            
            var strs = ConcatStrings(groupedStrings.Values.ToList());
            var kapec = ConcatPrikol(strs);
            await using var file = new StreamWriter("result.txt", false, Encoding.UTF8);
            foreach (var result in kapec)
            {
                await file.WriteLineAsync("=======");
                await file.WriteLineAsync(result);
            }
            //strs.ForEach(Console.WriteLine);

            // var xd = groupedStrings.Values.Aggregate(new List<List<string>>(), (accumulator, seq) =>
            //     (from ac in accumulator
            //     from item in seq
            //     select ac.Concat(new List<string>() {item}).ToList()).ToList());
            // foreach (var str in xd)
            // {
            //     str.ForEach(Console.WriteLine);
            // }
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

        private List<List<byte>> GetGroupedBytes(byte[] text, int keyLength)
        {
            var result = new List<List<byte>>();
            for (int i = 0; i < keyLength; i++)
            {
                var currentIndex = i;
                var buffer = new List<byte>();
                while (currentIndex < text.Length)
                {
                    buffer.Add(text[currentIndex]);
                    currentIndex += keyLength;
                }
                result.Add(buffer);
            }

            return result;
        }

        private List<string> FrequencyAnalysis(byte[] text)
        {
            var frequencyTables = new Dictionary<string, double>();
            for (byte i = 1; i != 0; i++)
            {
                var buffer = new List<byte>();
                var frequencyTable = new Dictionary<char, double>();
                foreach (var ch in text)
                {
                    buffer.Add((byte)(ch ^ i));
                }

                var str = Encoding.Default.GetString(buffer.ToArray());
                var letters = str.Where(char.IsLetter).ToList();
                letters.ForEach(x =>
                {
                    var charToAdd = char.ToLower(x);
                    if (!frequencyTable.ContainsKey(charToAdd))
                    {
                        frequencyTable.Add(charToAdd, 0);
                    }
                    frequencyTable[charToAdd] += 1;
                });
                
                foreach (var pair in FrequencyTable.Frequencies)
                {
                    if (frequencyTable.ContainsKey(pair.Key))
                    {
                        frequencyTable[pair.Key] /= letters.Count;
                        frequencyTable[pair.Key] = Math.Abs(FrequencyTable.Frequencies[pair.Key] - frequencyTable[pair.Key]);
                    }
                    else
                    {
                        frequencyTable.Add(pair.Key, pair.Value);
                    }
                }

                if (!frequencyTables.ContainsKey(str))
                {
                    frequencyTables.Add(str, frequencyTable.Values.Sum());
                }
            }

            return frequencyTables.OrderBy(x => x.Value).Take(5).Select(x => x.Key).ToList();
        }

        private List<List<string>> ConcatStrings(List<List<string>> groups)
        {
            var result = new List<List<string>>();
            int n = groups.Count;
 
            
            int []indices = new int[n];
 
            
            for(int i = 0; i < n; i++)
                indices[i] = 0;
 
            while (true)
            {
                var currentCombination = new List<string>();
                for (int i = 0; i < n; i++)
                {
                    currentCombination.Add(groups[i][indices[i]]);
                }
                
                result.Add(currentCombination);
                
                int next = n - 1;
                while (next >= 0 &&
                       (indices[next] + 1 >=
                        groups[next].Count))
                    next--;
 
               
                if (next < 0)
                    return result;
                
                indices[next]++;
                
                for(int i = next + 1; i < n; i++)
                    indices[i] = 0;
            }
        }

        private List<string> ConcatPrikol(List<List<string>> listsOfList)
        {
            var result = new List<string>();
            foreach (var list in listsOfList)
            {
                var builder = new StringBuilder();
                for (int i = 0; i < list.Count; i++)
                {
                    var insertIndex = i;
                    for (int j = 0; j < list[i].Length; j++)
                    {
                        builder.Insert(insertIndex + j, list[i][j]);
                        insertIndex += i;
                    }
                }
                result.Add(builder.ToString());
            }

            return result;
        }
        
    }
}