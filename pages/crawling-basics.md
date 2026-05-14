---
title: "BeautifulSoup 완전 정복 - HTML에서 데이터 추출하기"
date: "2026-05-13"
category: "Crawling"
tags: ["Python", "BeautifulSoup", "Web Crawling"]
thumbnail: "images/crawling_basics.png"
---

# 🍜 BeautifulSoup 완전 정복
## HTML에서 원하는 데이터만 골라내기

웹 크롤링의 첫 단추는 바로 **HTML 구조를 이해하고 필요한 정보를 찾아내는 것**입니다. 파이썬의 `BeautifulSoup` 라이브러리를 활용하면 복잡한 HTML 문서도 아주 쉽게 요리할 수 있습니다.

---

## 1. BeautifulSoup 핵심 함수 4가지

데이터를 찾을 때 가장 많이 사용하는 4가지 함수를 정리했습니다.

### ① `find()`: 첫 번째 요소만 찾기
```python
soup.find('div', class_='product-item')
```
- 조건에 맞는 **가장 첫 번째** 태그 하나만 반환합니다.
- 클래스명으로 찾을 때는 `class_` (언더바 포함)를 사용해야 합니다.

### ② `find_all()`: 조건에 맞는 모든 요소 찾기
```python
soup.find_all('span', class_='price')
```
- 결과값으로 **리스트**를 반환합니다. 반복문을 돌려 데이터를 추출할 때 유용합니다.

### ③ `select()` & `select_one()`: CSS 선택자로 찾기 ⭐
가장 강력하고 추천하는 방법입니다! 브라우저 개발자 도구의 선택자를 그대로 복사해서 쓸 수 있습니다.
```python
# 클래스로 찾기
soup.select('.product-item')

# 자식 요소 찾기
soup.select('div > span.name')
```

---

## 2. 데이터 추출의 정석

### 텍스트 추출 (`.text` vs `.get_text()`)
- `.text`: 태그 안의 모든 텍스트를 가져옵니다.
- `.get_text(strip=True)`: 앞뒤 공백을 자동으로 제거해줍니다.

### 속성값 추출 (`get`)
링크(`href`)나 이미지 경로(`src`)를 가져올 때 사용합니다.
```python
link.get('href') # 속성이 없어도 에러 대신 None을 반환하여 안전합니다.
```

---

## 3. ⚠️ 에러를 방지하는 'None 안전 처리' 패턴

크롤링을 하다 보면 가장 많이 마주치는 에러가 `AttributeError: 'NoneType' object has no attribute 'text'`입니다. 이를 방지하기 위해 다음과 같은 패턴을 권장합니다.

```python
# 요소가 존재할 때만 텍스트를 가져오는 한 줄 코드
name = el.text.strip() if el else "정보 없음"
```

---

## 🏗️ 실전 적용 예시

```python
all_items = soup.select('.product-item')

for item in all_items:
    name = item.select_one('.name').text.strip()
    price = item.select_one('.price').text.strip()
    print(f"상품명: {name}, 가격: {price}")
```

이제 기본적인 데이터 추출 준비는 끝났습니다! 다음 단계에서는 실제 사이트(사람인)를 대상으로 대량의 데이터를 수집하는 방법을 알아보겠습니다.
