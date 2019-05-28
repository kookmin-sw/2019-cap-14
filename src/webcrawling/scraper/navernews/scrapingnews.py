from bs4 import BeautifulSoup
import requests

url = 'https://news.naver.com/main/list.nhn?mode=LS2D&mid=shm&sid1=103&sid2=237'
req = requests.get(url)
 
if req.ok:
    html = req.text
    soup = BeautifulSoup(html,'html.parser')
 
titles_by_select = soup.select(
    '#main_content > div.list_body.newsflash_body > ul.type06_headline > li > dl > dt:nth-child(2) > a'
)
for title in titles_by_select:
    print(title.get_text())
    print(title.get('href'))