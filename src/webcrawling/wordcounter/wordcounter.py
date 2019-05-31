from collections import Counter
import re
import string
import csv

def get_tags(text):
    nouns = text.split(",")
    count = Counter(nouns)
    return_list = []
    #sorting noun by count
    for n, c in count.most_common():
        temp = {'tag': n, 'count': c}
        return_list.append(temp)
    return return_list

def main():
    input_file_name = input("input file name :: ")
    output_file_name = "output.csv"
    input_text = open(input_file_name + ".txt", 'r', -1)

    text = input_text.read()
    text = text.replace("\n", ",")
    tags = get_tags(text)
    output_text = open(input_file_name + output_file_name, 'w', -1)
    output_text.write('text,frequency\n')
    #set minimum frequency
    minfreq = 5
    for tag in tags:
        noun = tag['tag']
        count = tag['count']
        if noun == ' ':
            pass
        elif noun == '':
            pass
        else:
            if count >= minfreq:
                output_text.write('#{},{}\n'.format(noun, count))
            else:
                pass
    input_text.close()
    output_text.close() 
 
if __name__ == '__main__':
    main()