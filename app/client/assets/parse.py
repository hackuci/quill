import json
from bs4 import BeautifulSoup
import requests
if __name__ == "__main__":
    schools = open("schools.csv", "r", encoding="utf8")
    explored = set()
    for school in schools:
        explored.add(school)
    schools.close()
    schools = open("schools.csv", "a", encoding="utf8")
    page = requests.get("https://www.collegesimply.com/colleges/california/")
    soup = BeautifulSoup(page.text, 'html.parser')
    for a in soup.find(class_='table').find_all('a'):
        school = a.text
        if school not in explored:
            schools.write(school +'\n')

