---
title: "사람인 채용공고 크롤링: 사회복지 → 노인복지 심화 분석"
date: "2026-05-13"
category: "Crawling"
tags: ["Python", "BeautifulSoup", "Pandas", "크롤링"]
thumbnail: "images/crawling_practical.png"
---

# 🕵️ 사람인 채용공고 크롤링
## 사회복지 데이터 수집부터 노인복지 심화 분석까지

이번 포스팅에서는 **BeautifulSoup + Requests**를 활용하여 사람인(saramin.co.kr)에서 사회복지 채용공고를 수집하고, 키워드를 점진적으로 좁혀 **노인복지 분야**로 심화 분석하는 과정을 소개합니다.

---

## 🔄 2단계 데이터 수집 전략

단순히 데이터를 긁어오는 것에 그치지 않고, **"처음엔 넓게, 그 다음엔 좁게"**라는 전략으로 접근했습니다.

### 1단계: `사회복지` 키워드로 전체 파악

먼저 `사회복지`라는 넓은 키워드로 사이트 검색을 통해 41건의 데이터를 수집했습니다.

```python
keyword = '사회복지'
url = f'https://www.saramin.co.kr/zf_user/search/recruit?searchword={keyword}'
```

이 단계에서 데이터를 살펴보니, 병원 사회복지사, 지역아동센터, 장애인 활동지원, 노인복지 등 **다양한 분야가 혼재**되어 있었습니다.

### 2단계: `사회복지 노인`으로 심화 검색

1단계 데이터를 분석한 결과 **노인 관련 공고**가 상당히 많다는 것을 발견했고, 검색어를 구체화하여 다시 수집했습니다.

```python
keyword = '사회복지 노인'  # 두 단어를 조합하여 더 정확한 결과 도출
url = f'https://www.saramin.co.kr/zf_user/search/recruit?searchword={keyword}'
```

---

## 📊 수집 결과 비교

### 1차 수집 결과 (사회복지, 41건)

| 키워드 | 공고제목 | 지역 | 마감일 |
| :--- | :--- | :--- | :--- |
| 공공·복지 조회 TOP100 | [대동병원] 사회복지사 채용공고 | 대구 동구 | ~06/11 |
| 공공·복지 지원 TOP100 | 신입 사회복지사 채용 | 서울전체 | 내일마감 |
| 인기있는 | 한국사회복지협의회 직원 채용 | 서울 마포구 | ~05/22 |

### 2차 수집 결과 (사회복지 노인, 41건 / 핵심 공고)

| 공고제목 | 지역 | 고용형태 | 마감일 |
| :--- | :--- | :--- | :--- |
| 노인재활복지에 열정적인 신입 사회복지사 | 경기 고양시 | 정규직·계약직 | 오늘마감 |
| 노인주간보호센터 사회복지사 구인 | 부산 해운대구 | 계약직 | ~06/10 |
| 노인장기요양 담당 사회복지사 모집 | 대전 서구 | 정규직 | ~05/30 |
| 노인데이케어센터 사회복지사 모집 | 서울 관악구 | 기간제·계약직 | ~06/03 |
| 맘모스노인복지센터 사회복지사 채용 | 전남 순천시 | 정규직 | ~05/29 |

---

## 💡 핵심 인사이트

**1. 키워드 구체화 = 데이터 품질 향상**
- `사회복지` → `사회복지 노인` 으로 검색어를 구체화하니 관련 없는 공고가 크게 줄었습니다.
- 사이트 내 검색 기능을 최대한 활용하는 것이 크롤링 코드 내 필터링보다 효율적입니다.

**2. 고용형태 다양성**
- 노인복지 분야는 `정규직`, `계약직`, `무기계약직` 등 다양한 고용형태가 공존합니다.
- `기간제·계약직` 공고가 많아 육아휴직 대체 수요가 높은 분야임을 확인할 수 있었습니다.

**3. 지역 분포**
- 수도권(서울·경기·인천) 외에도 부산, 대전, 전남 등 전국적으로 고르게 공고가 분포합니다.

---

## 🔧 핵심 코드

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

def crawl_saramin(keyword):
    url = f'https://www.saramin.co.kr/zf_user/search/recruit?searchword={keyword}'
    headers = {'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0'}
    
    response = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    jobs = soup.select('div.item_recruit')
    rows = []
    
    for job in jobs:
        title_el = job.select_one('h2.job_tit a')
        badge_el = job.select_one('.area_badge .badge')
        conditions = job.select('.job_condition span')
        date_el = job.select_one('.job_date .date')
        
        rows.append({
            '키워드': badge_el.text.strip() if badge_el else None,
            '공고제목': title_el.get('title', '') if title_el else None,
            '조건': " / ".join([c.text.strip() for c in conditions]),
            '마감일': date_el.text.strip() if date_el else None
        })
    
    return pd.DataFrame(rows)

# 1단계: 넓게 수집
df1 = crawl_saramin('사회복지')
df1.to_csv('사람인_사회복지_채용공고.csv', index=False, encoding='utf-8-sig')

# 2단계: 좁혀서 수집
df2 = crawl_saramin('사회복지 노인')
df2.to_csv('사람인_사이트검색_사회복지_노인.csv', index=False, encoding='utf-8-sig')
```

---

## 📁 GitHub 연동

이 프로젝트의 전체 코드와 수집된 데이터는 아래 GitHub 레포지토리에서 확인하실 수 있습니다.

👉 [HaquHyup/crawling - 사람인 채용공고 크롤링](https://github.com/HaquHyup/crawling)

> 수집 데이터: `사람인_사회복지_채용공고.csv` / `사람인_사이트검색_사회복지_노인.csv`
