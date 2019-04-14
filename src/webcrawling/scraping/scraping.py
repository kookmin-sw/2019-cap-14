import time
import re
from selenium import webdriver
from datetime import datetime
now = datetime.now()
#invisible chromedriver
options = webdriver.ChromeOptions()	
options.add_argument('headless')	
options.add_argument('disable-gpu')	
url = "https://www.instagram.com/explore/tags/%EA%B5%AD%EB%AF%BC%EB%8C%80/"
driver = webdriver.Chrome(options=options)
driver.implicitly_wait(5) 
driver.get(url)
driver.find_element_by_xpath('//*[@id="react-root"]/section/main/article/div[1]/div/div/div[1]/div[1]/a/div[1]/div[2]').click()
hashtag_regex = "(#[0-9a-zA-Z가-힣]*)"
p = re.compile(hashtag_regex)
Scrapcount = 1
while Scrapcount <= 20:
    try:
        hashtagtext = driver.find_element_by_class_name('k59kT').text
        #find hashtag in text
        r = p.findall(hashtagtext)
        print(r)
    except:
        pass
    if Scrapcount == 1:
        driver.find_element_by_xpath('/html/body/div[4]/div[1]/div/div/a').click()
    else:
        driver.find_element_by_xpath('/html/body/div[4]/div[1]/div/div/a[2]').click()
    time.sleep(2)
    Scrapcount += 1
print ( '%s-%s-%s' % ( now.year, now.month, now.day ) )
driver.close()