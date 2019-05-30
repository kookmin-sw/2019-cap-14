from collections import Counter
import re
import string
import csv

def get_kor_tags(text):
    nouns = text.split(",")
    count = Counter(nouns)
    return_list = []
    for n, c in count.most_common():
        temp = {'tag': n, 'count': c}
        return_list.append(temp)
    return return_list

def main():
    input_file_name = input("input file name :: ")
    output_file_name = "output.csv"
    input_text = open(input_file_name + ".txt", 'r', -1, "utf-8")
    text = input_text.read()
    frequency = {}
    get_eng_text = re.findall(r'\b[0-9a-zA-Z]{3,15}\b', text)
    for word in get_eng_text:
        count = frequency.get(word,0)
        frequency[word] = count + 1
    frequency_list = frequency.keys()
    tags = get_kor_tags(text)
    input_text.close()
    output_text = open(input_file_name + output_file_name, 'w', -1)
    output_text.write('text,frequency\n')
    for tag in tags:
        noun = tag['tag']
        count = tag['count']
        if count >= 3:
            output_text.write('#{},{}\n'.format(noun, count))
        else:
            pass
    for words in frequency_list:
        if count >= 3:
            output_text.write('#{},{}\n'.format(words, frequency[words]))
        else:
            pass
    output_text.close() 
 
if __name__ == '__main__':
    main()