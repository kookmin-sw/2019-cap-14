import time
import re
import csv
from selenium import webdriver

#input keyword
tag = input("input keyword :: ")
f = open(tag + '.txt', 'w', encoding='UTF-8', newline='')
wr = csv.writer(f)

#invisible chromedriver
options = webdriver.ChromeOptions()	
options.add_argument('headless')	
options.add_argument('disable-gpu')

url = "https://www.instagram.com/explore/tags/" + tag
driver = webdriver.Chrome(options=options)
#driver = webdriver.Chrome()

driver.implicitly_wait(5) 
driver.get(url)
driver.find_element_by_xpath('//*[@id="react-root"]/section/main/article/div[1]/div/div/div[1]/div[1]/a/div[1]/div[2]').click()
hashtag_regex = "#([0-9a-zA-Z가-힣]*)"
p = re.compile(hashtag_regex)
Scrapcount = 1
#set scraping number
while Scrapcount <= 5:
    print(Scrapcount)
    try:
        hashtagtext = driver.find_element_by_class_name('P9YgZ').text
        r = p.findall(hashtagtext)
        wr.writerow(r)
    except:
        print("pass")
        pass
    #click next page
    if Scrapcount == 1:
        driver.find_element_by_xpath('/html/body/div[4]/div[1]/div/div/a').click()
    else:
        driver.find_element_by_xpath('/html/body/div[4]/div[1]/div/div/a[2]').click()
    time.sleep(1.5)
    Scrapcount += 1
print("complete")
f.close()
driver.close()