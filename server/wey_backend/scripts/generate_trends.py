# -*- coding: utf-8 -*-

import django
import os
import sys

from datetime import timedelta
from collections import Counter
from django.utils import timezone
from bs4 import BeautifulSoup
import re


sys.path.append(os.path.join(os.path.abspath(os.path.dirname(__file__)), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "wey_backend.settings")
django.setup()


from post.models import Post, Trend

def extract_hashtags(text, trends):
    # 首先检查文本是否包含HTML标签
    if '<' in text and '>' in text:
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(text, 'html.parser')
        # 获取所有文本内容，忽略HTML标签
        text = soup.get_text(' ', strip=True)
    
    # 使用正则表达式匹配标签
    hashtag_pattern = r'#([\w\d\u4e00-\u9fa5]+)'
    matches = re.findall(hashtag_pattern, text)
    
    for match in matches:
        trends.append(match)
    
    return trends

for trend in Trend.objects.all():
    trend.delete()

trends = []
this_hour = timezone.now().replace(minute=0, second=0, microsecond=0)
twenty_four_hours = this_hour - timedelta(hours=24)

for post in Post.objects.filter(created_at__gte=twenty_four_hours).filter(is_private=False):
    extract_hashtags(post.body, trends)

for trend in Counter(trends).most_common(10):
    Trend.objects.create(hashtag=trend[0], occurences=trend[1])