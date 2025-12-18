'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check, X, Trophy, Lock, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
interface Word {
  id: string;
  romaji: string;
  english: string;
}

interface WordProgress {
  wordId: string;
  correctCount: number;
  incorrectCount: number;
  lastSeen: number;
  nextReview: number;
  mastered: boolean;
}

interface LevelProgress {
  level: number;
  questionsAnswered: number;
  correctAnswers: number;
  completed: boolean;
  unlocked: boolean;
}

type Quest = 'A' | 'B';

// Quest A - Foundational Japanese (200 words across 10 levels)
const QUEST_A_WORDS: Word[][] = [
  // Level 1 - Basic Greetings
  [
    { id: 'a1-1', romaji: 'konnichiwa', english: 'hello' },
    { id: 'a1-2', romaji: 'ohayou', english: 'good morning' },
    { id: 'a1-3', romaji: 'konbanwa', english: 'good evening' },
    { id: 'a1-4', romaji: 'sayounara', english: 'goodbye' },
    { id: 'a1-5', romaji: 'arigatou', english: 'thank you' },
    { id: 'a1-6', romaji: 'sumimasen', english: 'excuse me' },
    { id: 'a1-7', romaji: 'gomen', english: 'sorry' },
    { id: 'a1-8', romaji: 'hai', english: 'yes' },
    { id: 'a1-9', romaji: 'iie', english: 'no' },
    { id: 'a1-10', romaji: 'onegai', english: 'please' },
    { id: 'a1-11', romaji: 'doumo', english: 'thanks' },
    { id: 'a1-12', romaji: 'oyasumi', english: 'good night' },
    { id: 'a1-13', romaji: 'mata', english: 'again' },
    { id: 'a1-14', romaji: 'ja ne', english: 'see you' },
    { id: 'a1-15', romaji: 'ogenki', english: 'how are you' },
    { id: 'a1-16', romaji: 'genki', english: 'fine' },
    { id: 'a1-17', romaji: 'hajimemashite', english: 'nice to meet you' },
    { id: 'a1-18', romaji: 'yoroshiku', english: 'pleased to meet you' },
    { id: 'a1-19', romaji: 'douzo', english: 'here you go' },
    { id: 'a1-20', romaji: 'itadakimasu', english: 'bon appetit' },
  ],
  // Level 2 - Numbers
  [
    { id: 'a2-1', romaji: 'ichi', english: 'one' },
    { id: 'a2-2', romaji: 'ni', english: 'two' },
    { id: 'a2-3', romaji: 'san', english: 'three' },
    { id: 'a2-4', romaji: 'yon', english: 'four' },
    { id: 'a2-5', romaji: 'go', english: 'five' },
    { id: 'a2-6', romaji: 'roku', english: 'six' },
    { id: 'a2-7', romaji: 'nana', english: 'seven' },
    { id: 'a2-8', romaji: 'hachi', english: 'eight' },
    { id: 'a2-9', romaji: 'kyuu', english: 'nine' },
    { id: 'a2-10', romaji: 'juu', english: 'ten' },
    { id: 'a2-11', romaji: 'hyaku', english: 'hundred' },
    { id: 'a2-12', romaji: 'sen', english: 'thousand' },
    { id: 'a2-13', romaji: 'man', english: 'ten thousand' },
    { id: 'a2-14', romaji: 'rei', english: 'zero' },
    { id: 'a2-15', romaji: 'juuichi', english: 'eleven' },
    { id: 'a2-16', romaji: 'juuni', english: 'twelve' },
    { id: 'a2-17', romaji: 'nijuu', english: 'twenty' },
    { id: 'a2-18', romaji: 'sanjuu', english: 'thirty' },
    { id: 'a2-19', romaji: 'gojuu', english: 'fifty' },
    { id: 'a2-20', romaji: 'hyakunen', english: 'century' },
  ],
  // Level 3 - Colors & Basic Adjectives
  [
    { id: 'a3-1', romaji: 'aka', english: 'red' },
    { id: 'a3-2', romaji: 'ao', english: 'blue' },
    { id: 'a3-3', romaji: 'kiiro', english: 'yellow' },
    { id: 'a3-4', romaji: 'midori', english: 'green' },
    { id: 'a3-5', romaji: 'shiro', english: 'white' },
    { id: 'a3-6', romaji: 'kuro', english: 'black' },
    { id: 'a3-7', romaji: 'chairo', english: 'brown' },
    { id: 'a3-8', romaji: 'murasaki', english: 'purple' },
    { id: 'a3-9', romaji: 'pinku', english: 'pink' },
    { id: 'a3-10', romaji: 'orenji', english: 'orange' },
    { id: 'a3-11', romaji: 'ookii', english: 'big' },
    { id: 'a3-12', romaji: 'chiisai', english: 'small' },
    { id: 'a3-13', romaji: 'nagai', english: 'long' },
    { id: 'a3-14', romaji: 'mijikai', english: 'short' },
    { id: 'a3-15', romaji: 'atarashii', english: 'new' },
    { id: 'a3-16', romaji: 'furui', english: 'old' },
    { id: 'a3-17', romaji: 'takai', english: 'expensive' },
    { id: 'a3-18', romaji: 'yasui', english: 'cheap' },
    { id: 'a3-19', romaji: 'hayai', english: 'fast' },
    { id: 'a3-20', romaji: 'osoi', english: 'slow' },
  ],
  // Level 4 - Food & Drinks
  [
    { id: 'a4-1', romaji: 'mizu', english: 'water' },
    { id: 'a4-2', romaji: 'gohan', english: 'rice' },
    { id: 'a4-3', romaji: 'ocha', english: 'tea' },
    { id: 'a4-4', romaji: 'sakana', english: 'fish' },
    { id: 'a4-5', romaji: 'niku', english: 'meat' },
    { id: 'a4-6', romaji: 'yasai', english: 'vegetable' },
    { id: 'a4-7', romaji: 'kudamono', english: 'fruit' },
    { id: 'a4-8', romaji: 'pan', english: 'bread' },
    { id: 'a4-9', romaji: 'tamago', english: 'egg' },
    { id: 'a4-10', romaji: 'gyuunyuu', english: 'milk' },
    { id: 'a4-11', romaji: 'koohii', english: 'coffee' },
    { id: 'a4-12', romaji: 'biiru', english: 'beer' },
    { id: 'a4-13', romaji: 'sake', english: 'alcohol' },
    { id: 'a4-14', romaji: 'ringo', english: 'apple' },
    { id: 'a4-15', romaji: 'banana', english: 'banana' },
    { id: 'a4-16', romaji: 'tori', english: 'chicken' },
    { id: 'a4-17', romaji: 'buta', english: 'pork' },
    { id: 'a4-18', romaji: 'gyuu', english: 'beef' },
    { id: 'a4-19', romaji: 'shio', english: 'salt' },
    { id: 'a4-20', romaji: 'satou', english: 'sugar' },
  ],
  // Level 5 - Family
  [
    { id: 'a5-1', romaji: 'kazoku', english: 'family' },
    { id: 'a5-2', romaji: 'chichi', english: 'father' },
    { id: 'a5-3', romaji: 'haha', english: 'mother' },
    { id: 'a5-4', romaji: 'ani', english: 'older brother' },
    { id: 'a5-5', romaji: 'ane', english: 'older sister' },
    { id: 'a5-6', romaji: 'otouto', english: 'younger brother' },
    { id: 'a5-7', romaji: 'imouto', english: 'younger sister' },
    { id: 'a5-8', romaji: 'sofu', english: 'grandfather' },
    { id: 'a5-9', romaji: 'sobo', english: 'grandmother' },
    { id: 'a5-10', romaji: 'musuko', english: 'son' },
    { id: 'a5-11', romaji: 'musume', english: 'daughter' },
    { id: 'a5-12', romaji: 'otto', english: 'husband' },
    { id: 'a5-13', romaji: 'tsuma', english: 'wife' },
    { id: 'a5-14', romaji: 'kodomo', english: 'child' },
    { id: 'a5-15', romaji: 'akachan', english: 'baby' },
    { id: 'a5-16', romaji: 'oji', english: 'uncle' },
    { id: 'a5-17', romaji: 'oba', english: 'aunt' },
    { id: 'a5-18', romaji: 'itoko', english: 'cousin' },
    { id: 'a5-19', romaji: 'mago', english: 'grandchild' },
    { id: 'a5-20', romaji: 'kyoudai', english: 'siblings' },
  ],
  // Level 6 - Time & Days
  [
    { id: 'a6-1', romaji: 'ima', english: 'now' },
    { id: 'a6-2', romaji: 'kyou', english: 'today' },
    { id: 'a6-3', romaji: 'ashita', english: 'tomorrow' },
    { id: 'a6-4', romaji: 'kinou', english: 'yesterday' },
    { id: 'a6-5', romaji: 'asa', english: 'morning' },
    { id: 'a6-6', romaji: 'hiru', english: 'noon' },
    { id: 'a6-7', romaji: 'yoru', english: 'night' },
    { id: 'a6-8', romaji: 'getsuyoubi', english: 'monday' },
    { id: 'a6-9', romaji: 'kayoubi', english: 'tuesday' },
    { id: 'a6-10', romaji: 'suiyoubi', english: 'wednesday' },
    { id: 'a6-11', romaji: 'mokuyoubi', english: 'thursday' },
    { id: 'a6-12', romaji: 'kinyoubi', english: 'friday' },
    { id: 'a6-13', romaji: 'doyoubi', english: 'saturday' },
    { id: 'a6-14', romaji: 'nichiyoubi', english: 'sunday' },
    { id: 'a6-15', romaji: 'shuumatsu', english: 'weekend' },
    { id: 'a6-16', romaji: 'jikan', english: 'time' },
    { id: 'a6-17', romaji: 'fun', english: 'minute' },
    { id: 'a6-18', romaji: 'byou', english: 'second' },
    { id: 'a6-19', romaji: 'tsuki', english: 'month' },
    { id: 'a6-20', romaji: 'toshi', english: 'year' },
  ],
  // Level 7 - Places
  [
    { id: 'a7-1', romaji: 'ie', english: 'house' },
    { id: 'a7-2', romaji: 'gakkou', english: 'school' },
    { id: 'a7-3', romaji: 'kaisha', english: 'company' },
    { id: 'a7-4', romaji: 'eki', english: 'station' },
    { id: 'a7-5', romaji: 'mise', english: 'shop' },
    { id: 'a7-6', romaji: 'resutoran', english: 'restaurant' },
    { id: 'a7-7', romaji: 'byouin', english: 'hospital' },
    { id: 'a7-8', romaji: 'ginkou', english: 'bank' },
    { id: 'a7-9', romaji: 'yuubinkyoku', english: 'post office' },
    { id: 'a7-10', romaji: 'kouen', english: 'park' },
    { id: 'a7-11', romaji: 'hoteru', english: 'hotel' },
    { id: 'a7-12', romaji: 'kuukou', english: 'airport' },
    { id: 'a7-13', romaji: 'toshokan', english: 'library' },
    { id: 'a7-14', romaji: 'eiga', english: 'cinema' },
    { id: 'a7-15', romaji: 'depato', english: 'department store' },
    { id: 'a7-16', romaji: 'konbini', english: 'convenience store' },
    { id: 'a7-17', romaji: 'heya', english: 'room' },
    { id: 'a7-18', romaji: 'machi', english: 'town' },
    { id: 'a7-19', romaji: 'kuni', english: 'country' },
    { id: 'a7-20', romaji: 'sekai', english: 'world' },
  ],
  // Level 8 - Verbs (Basic)
  [
    { id: 'a8-1', romaji: 'taberu', english: 'to eat' },
    { id: 'a8-2', romaji: 'nomu', english: 'to drink' },
    { id: 'a8-3', romaji: 'iku', english: 'to go' },
    { id: 'a8-4', romaji: 'kuru', english: 'to come' },
    { id: 'a8-5', romaji: 'miru', english: 'to see' },
    { id: 'a8-6', romaji: 'kiku', english: 'to hear' },
    { id: 'a8-7', romaji: 'hanasu', english: 'to speak' },
    { id: 'a8-8', romaji: 'yomu', english: 'to read' },
    { id: 'a8-9', romaji: 'kaku', english: 'to write' },
    { id: 'a8-10', romaji: 'suru', english: 'to do' },
    { id: 'a8-11', romaji: 'neru', english: 'to sleep' },
    { id: 'a8-12', romaji: 'okiru', english: 'to wake up' },
    { id: 'a8-13', romaji: 'aruku', english: 'to walk' },
    { id: 'a8-14', romaji: 'hashiru', english: 'to run' },
    { id: 'a8-15', romaji: 'kau', english: 'to buy' },
    { id: 'a8-16', romaji: 'uru', english: 'to sell' },
    { id: 'a8-17', romaji: 'matsu', english: 'to wait' },
    { id: 'a8-18', romaji: 'au', english: 'to meet' },
    { id: 'a8-19', romaji: 'shinu', english: 'to die' },
    { id: 'a8-20', romaji: 'ikiru', english: 'to live' },
  ],
  // Level 9 - Common Phrases
  [
    { id: 'a9-1', romaji: 'wakarimasen', english: 'I dont understand' },
    { id: 'a9-2', romaji: 'wakarimasu', english: 'I understand' },
    { id: 'a9-3', romaji: 'nihongo', english: 'Japanese language' },
    { id: 'a9-4', romaji: 'eigo', english: 'English language' },
    { id: 'a9-5', romaji: 'ikura', english: 'how much' },
    { id: 'a9-6', romaji: 'doko', english: 'where' },
    { id: 'a9-7', romaji: 'itsu', english: 'when' },
    { id: 'a9-8', romaji: 'naze', english: 'why' },
    { id: 'a9-9', romaji: 'dare', english: 'who' },
    { id: 'a9-10', romaji: 'nani', english: 'what' },
    { id: 'a9-11', romaji: 'dou', english: 'how' },
    { id: 'a9-12', romaji: 'chotto', english: 'a little' },
    { id: 'a9-13', romaji: 'totemo', english: 'very' },
    { id: 'a9-14', romaji: 'motto', english: 'more' },
    { id: 'a9-15', romaji: 'mada', english: 'still' },
    { id: 'a9-16', romaji: 'mou', english: 'already' },
    { id: 'a9-17', romaji: 'tabun', english: 'maybe' },
    { id: 'a9-18', romaji: 'zettai', english: 'definitely' },
    { id: 'a9-19', romaji: 'hontou', english: 'really' },
    { id: 'a9-20', romaji: 'daijoubu', english: 'its okay' },
  ],
  // Level 10 - Body & Health
  [
    { id: 'a10-1', romaji: 'karada', english: 'body' },
    { id: 'a10-2', romaji: 'atama', english: 'head' },
    { id: 'a10-3', romaji: 'kao', english: 'face' },
    { id: 'a10-4', romaji: 'me', english: 'eye' },
    { id: 'a10-5', romaji: 'mimi', english: 'ear' },
    { id: 'a10-6', romaji: 'hana', english: 'nose' },
    { id: 'a10-7', romaji: 'kuchi', english: 'mouth' },
    { id: 'a10-8', romaji: 'te', english: 'hand' },
    { id: 'a10-9', romaji: 'ashi', english: 'foot' },
    { id: 'a10-10', romaji: 'onaka', english: 'stomach' },
    { id: 'a10-11', romaji: 'senaka', english: 'back' },
    { id: 'a10-12', romaji: 'kami', english: 'hair' },
    { id: 'a10-13', romaji: 'ha', english: 'tooth' },
    { id: 'a10-14', romaji: 'yubi', english: 'finger' },
    { id: 'a10-15', romaji: 'kokoro', english: 'heart' },
    { id: 'a10-16', romaji: 'byouki', english: 'illness' },
    { id: 'a10-17', romaji: 'kusuri', english: 'medicine' },
    { id: 'a10-18', romaji: 'isha', english: 'doctor' },
    { id: 'a10-19', romaji: 'itai', english: 'painful' },
    { id: 'a10-20', romaji: 'kenkou', english: 'health' },
  ],
];

// Quest B - Advanced Japanese (200 words across 10 levels)
const QUEST_B_WORDS: Word[][] = [
  // Level 1 - Nature
  [
    { id: 'b1-1', romaji: 'sora', english: 'sky' },
    { id: 'b1-2', romaji: 'umi', english: 'sea' },
    { id: 'b1-3', romaji: 'yama', english: 'mountain' },
    { id: 'b1-4', romaji: 'kawa', english: 'river' },
    { id: 'b1-5', romaji: 'mori', english: 'forest' },
    { id: 'b1-6', romaji: 'hana', english: 'flower' },
    { id: 'b1-7', romaji: 'ki', english: 'tree' },
    { id: 'b1-8', romaji: 'taiyou', english: 'sun' },
    { id: 'b1-9', romaji: 'tsuki', english: 'moon' },
    { id: 'b1-10', romaji: 'hoshi', english: 'star' },
    { id: 'b1-11', romaji: 'kumo', english: 'cloud' },
    { id: 'b1-12', romaji: 'ame', english: 'rain' },
    { id: 'b1-13', romaji: 'yuki', english: 'snow' },
    { id: 'b1-14', romaji: 'kaze', english: 'wind' },
    { id: 'b1-15', romaji: 'nami', english: 'wave' },
    { id: 'b1-16', romaji: 'iwa', english: 'rock' },
    { id: 'b1-17', romaji: 'suna', english: 'sand' },
    { id: 'b1-18', romaji: 'kusa', english: 'grass' },
    { id: 'b1-19', romaji: 'ha', english: 'leaf' },
    { id: 'b1-20', romaji: 'shizen', english: 'nature' },
  ],
  // Level 2 - Animals
  [
    { id: 'b2-1', romaji: 'inu', english: 'dog' },
    { id: 'b2-2', romaji: 'neko', english: 'cat' },
    { id: 'b2-3', romaji: 'tori', english: 'bird' },
    { id: 'b2-4', romaji: 'uma', english: 'horse' },
    { id: 'b2-5', romaji: 'ushi', english: 'cow' },
    { id: 'b2-6', romaji: 'buta', english: 'pig' },
    { id: 'b2-7', romaji: 'hitsuji', english: 'sheep' },
    { id: 'b2-8', romaji: 'usagi', english: 'rabbit' },
    { id: 'b2-9', romaji: 'kuma', english: 'bear' },
    { id: 'b2-10', romaji: 'zou', english: 'elephant' },
    { id: 'b2-11', romaji: 'saru', english: 'monkey' },
    { id: 'b2-12', romaji: 'hebi', english: 'snake' },
    { id: 'b2-13', romaji: 'sakana', english: 'fish' },
    { id: 'b2-14', romaji: 'kame', english: 'turtle' },
    { id: 'b2-15', romaji: 'kaeru', english: 'frog' },
    { id: 'b2-16', romaji: 'mushi', english: 'insect' },
    { id: 'b2-17', romaji: 'chou', english: 'butterfly' },
    { id: 'b2-18', romaji: 'nezumi', english: 'mouse' },
    { id: 'b2-19', romaji: 'kitsune', english: 'fox' },
    { id: 'b2-20', romaji: 'doubutsu', english: 'animal' },
  ],
  // Level 3 - Emotions
  [
    { id: 'b3-1', romaji: 'ureshii', english: 'happy' },
    { id: 'b3-2', romaji: 'kanashii', english: 'sad' },
    { id: 'b3-3', romaji: 'okoru', english: 'angry' },
    { id: 'b3-4', romaji: 'kowai', english: 'scary' },
    { id: 'b3-5', romaji: 'tanoshii', english: 'fun' },
    { id: 'b3-6', romaji: 'tsumaranai', english: 'boring' },
    { id: 'b3-7', romaji: 'samishii', english: 'lonely' },
    { id: 'b3-8', romaji: 'hazukashii', english: 'embarrassed' },
    { id: 'b3-9', romaji: 'shinpai', english: 'worried' },
    { id: 'b3-10', romaji: 'anshin', english: 'relieved' },
    { id: 'b3-11', romaji: 'odoroku', english: 'surprised' },
    { id: 'b3-12', romaji: 'naku', english: 'to cry' },
    { id: 'b3-13', romaji: 'warau', english: 'to laugh' },
    { id: 'b3-14', romaji: 'ai', english: 'love' },
    { id: 'b3-15', romaji: 'nikumu', english: 'to hate' },
    { id: 'b3-16', romaji: 'yorokobu', english: 'to rejoice' },
    { id: 'b3-17', romaji: 'kibun', english: 'mood' },
    { id: 'b3-18', romaji: 'kimochi', english: 'feeling' },
    { id: 'b3-19', romaji: 'omou', english: 'to think' },
    { id: 'b3-20', romaji: 'kanjiru', english: 'to feel' },
  ],
  // Level 4 - Weather & Seasons
  [
    { id: 'b4-1', romaji: 'tenki', english: 'weather' },
    { id: 'b4-2', romaji: 'hare', english: 'sunny' },
    { id: 'b4-3', romaji: 'kumori', english: 'cloudy' },
    { id: 'b4-4', romaji: 'arashi', english: 'storm' },
    { id: 'b4-5', romaji: 'kaminari', english: 'thunder' },
    { id: 'b4-6', romaji: 'kiri', english: 'fog' },
    { id: 'b4-7', romaji: 'atsui', english: 'hot' },
    { id: 'b4-8', romaji: 'samui', english: 'cold' },
    { id: 'b4-9', romaji: 'suzushii', english: 'cool' },
    { id: 'b4-10', romaji: 'atatakai', english: 'warm' },
    { id: 'b4-11', romaji: 'haru', english: 'spring' },
    { id: 'b4-12', romaji: 'natsu', english: 'summer' },
    { id: 'b4-13', romaji: 'aki', english: 'autumn' },
    { id: 'b4-14', romaji: 'fuyu', english: 'winter' },
    { id: 'b4-15', romaji: 'kisetsu', english: 'season' },
    { id: 'b4-16', romaji: 'mushiatsui', english: 'humid' },
    { id: 'b4-17', romaji: 'koori', english: 'ice' },
    { id: 'b4-18', romaji: 'niji', english: 'rainbow' },
    { id: 'b4-19', romaji: 'tsuyu', english: 'rainy season' },
    { id: 'b4-20', romaji: 'taifuu', english: 'typhoon' },
  ],
  // Level 5 - Work & Study
  [
    { id: 'b5-1', romaji: 'shigoto', english: 'work' },
    { id: 'b5-2', romaji: 'benkyou', english: 'study' },
    { id: 'b5-3', romaji: 'kaigi', english: 'meeting' },
    { id: 'b5-4', romaji: 'purojekuto', english: 'project' },
    { id: 'b5-5', romaji: 'shachou', english: 'company president' },
    { id: 'b5-6', romaji: 'buchou', english: 'department head' },
    { id: 'b5-7', romaji: 'douryou', english: 'colleague' },
    { id: 'b5-8', romaji: 'kyuuryou', english: 'salary' },
    { id: 'b5-9', romaji: 'yasumi', english: 'holiday' },
    { id: 'b5-10', romaji: 'zangyou', english: 'overtime' },
    { id: 'b5-11', romaji: 'sensei', english: 'teacher' },
    { id: 'b5-12', romaji: 'gakusei', english: 'student' },
    { id: 'b5-13', romaji: 'shiken', english: 'exam' },
    { id: 'b5-14', romaji: 'shukudai', english: 'homework' },
    { id: 'b5-15', romaji: 'jugyou', english: 'class' },
    { id: 'b5-16', romaji: 'sotsugyou', english: 'graduation' },
    { id: 'b5-17', romaji: 'mensetsu', english: 'interview' },
    { id: 'b5-18', romaji: 'keiken', english: 'experience' },
    { id: 'b5-19', romaji: 'nouryoku', english: 'ability' },
    { id: 'b5-20', romaji: 'mokuhyou', english: 'goal' },
  ],
  // Level 6 - Transport
  [
    { id: 'b6-1', romaji: 'kuruma', english: 'car' },
    { id: 'b6-2', romaji: 'densha', english: 'train' },
    { id: 'b6-3', romaji: 'basu', english: 'bus' },
    { id: 'b6-4', romaji: 'hikouki', english: 'airplane' },
    { id: 'b6-5', romaji: 'fune', english: 'ship' },
    { id: 'b6-6', romaji: 'jitensha', english: 'bicycle' },
    { id: 'b6-7', romaji: 'takushii', english: 'taxi' },
    { id: 'b6-8', romaji: 'shinkansen', english: 'bullet train' },
    { id: 'b6-9', romaji: 'chikatetsu', english: 'subway' },
    { id: 'b6-10', romaji: 'michi', english: 'road' },
    { id: 'b6-11', romaji: 'kippu', english: 'ticket' },
    { id: 'b6-12', romaji: 'noriba', english: 'platform' },
    { id: 'b6-13', romaji: 'tsuukin', english: 'commute' },
    { id: 'b6-14', romaji: 'norikae', english: 'transfer' },
    { id: 'b6-15', romaji: 'teisha', english: 'stop' },
    { id: 'b6-16', romaji: 'shuppatsu', english: 'departure' },
    { id: 'b6-17', romaji: 'touchaku', english: 'arrival' },
    { id: 'b6-18', romaji: 'ryokou', english: 'travel' },
    { id: 'b6-19', romaji: 'unten', english: 'driving' },
    { id: 'b6-20', romaji: 'koutsuuu', english: 'traffic' },
  ],
  // Level 7 - Technology
  [
    { id: 'b7-1', romaji: 'pasokon', english: 'computer' },
    { id: 'b7-2', romaji: 'sumaho', english: 'smartphone' },
    { id: 'b7-3', romaji: 'intanetto', english: 'internet' },
    { id: 'b7-4', romaji: 'meeru', english: 'email' },
    { id: 'b7-5', romaji: 'sofuto', english: 'software' },
    { id: 'b7-6', romaji: 'apuri', english: 'app' },
    { id: 'b7-7', romaji: 'gamen', english: 'screen' },
    { id: 'b7-8', romaji: 'kiiboodo', english: 'keyboard' },
    { id: 'b7-9', romaji: 'mausu', english: 'mouse' },
    { id: 'b7-10', romaji: 'purinta', english: 'printer' },
    { id: 'b7-11', romaji: 'fairu', english: 'file' },
    { id: 'b7-12', romaji: 'deta', english: 'data' },
    { id: 'b7-13', romaji: 'setsuzoku', english: 'connection' },
    { id: 'b7-14', romaji: 'pasuwaado', english: 'password' },
    { id: 'b7-15', romaji: 'daunnroodo', english: 'download' },
    { id: 'b7-16', romaji: 'appuroodo', english: 'upload' },
    { id: 'b7-17', romaji: 'kensaku', english: 'search' },
    { id: 'b7-18', romaji: 'kikai', english: 'machine' },
    { id: 'b7-19', romaji: 'robotto', english: 'robot' },
    { id: 'b7-20', romaji: 'gijutsu', english: 'technology' },
  ],
  // Level 8 - Shopping & Money
  [
    { id: 'b8-1', romaji: 'okane', english: 'money' },
    { id: 'b8-2', romaji: 'en', english: 'yen' },
    { id: 'b8-3', romaji: 'nedan', english: 'price' },
    { id: 'b8-4', romaji: 'kaimono', english: 'shopping' },
    { id: 'b8-5', romaji: 'seihin', english: 'product' },
    { id: 'b8-6', romaji: 'saizu', english: 'size' },
    { id: 'b8-7', romaji: 'iro', english: 'color' },
    { id: 'b8-8', romaji: 'waribiki', english: 'discount' },
    { id: 'b8-9', romaji: 'reshiito', english: 'receipt' },
    { id: 'b8-10', romaji: 'genkin', english: 'cash' },
    { id: 'b8-11', romaji: 'kurejitto', english: 'credit card' },
    { id: 'b8-12', romaji: 'otsuri', english: 'change' },
    { id: 'b8-13', romaji: 'seerusu', english: 'sale' },
    { id: 'b8-14', romaji: 'chuumon', english: 'order' },
    { id: 'b8-15', romaji: 'haitatsu', english: 'delivery' },
    { id: 'b8-16', romaji: 'henpin', english: 'return' },
    { id: 'b8-17', romaji: 'houshuu', english: 'reward' },
    { id: 'b8-18', romaji: 'chokin', english: 'savings' },
    { id: 'b8-19', romaji: 'shakkin', english: 'debt' },
    { id: 'b8-20', romaji: 'keizai', english: 'economy' },
  ],
  // Level 9 - Culture & Arts
  [
    { id: 'b9-1', romaji: 'bunka', english: 'culture' },
    { id: 'b9-2', romaji: 'geijutsu', english: 'art' },
    { id: 'b9-3', romaji: 'ongaku', english: 'music' },
    { id: 'b9-4', romaji: 'eiga', english: 'movie' },
    { id: 'b9-5', romaji: 'engeki', english: 'theater' },
    { id: 'b9-6', romaji: 'bijutsukan', english: 'museum' },
    { id: 'b9-7', romaji: 'matsuri', english: 'festival' },
    { id: 'b9-8', romaji: 'dentou', english: 'tradition' },
    { id: 'b9-9', romaji: 'shuuryou', english: 'religion' },
    { id: 'b9-10', romaji: 'jinja', english: 'shrine' },
    { id: 'b9-11', romaji: 'otera', english: 'temple' },
    { id: 'b9-12', romaji: 'kimono', english: 'kimono' },
    { id: 'b9-13', romaji: 'origami', english: 'origami' },
    { id: 'b9-14', romaji: 'ikebana', english: 'flower arrangement' },
    { id: 'b9-15', romaji: 'sadou', english: 'tea ceremony' },
    { id: 'b9-16', romaji: 'shodo', english: 'calligraphy' },
    { id: 'b9-17', romaji: 'manga', english: 'comics' },
    { id: 'b9-18', romaji: 'anime', english: 'anime' },
    { id: 'b9-19', romaji: 'rekishi', english: 'history' },
    { id: 'b9-20', romaji: 'bungaku', english: 'literature' },
  ],
  // Level 10 - Advanced Verbs
  [
    { id: 'b10-1', romaji: 'kangaeru', english: 'to think deeply' },
    { id: 'b10-2', romaji: 'shinjiru', english: 'to believe' },
    { id: 'b10-3', romaji: 'wasureru', english: 'to forget' },
    { id: 'b10-4', romaji: 'oboeru', english: 'to remember' },
    { id: 'b10-5', romaji: 'erabu', english: 'to choose' },
    { id: 'b10-6', romaji: 'kimeru', english: 'to decide' },
    { id: 'b10-7', romaji: 'tsuzukeru', english: 'to continue' },
    { id: 'b10-8', romaji: 'yameru', english: 'to quit' },
    { id: 'b10-9', romaji: 'hajimeru', english: 'to begin' },
    { id: 'b10-10', romaji: 'owaru', english: 'to end' },
    { id: 'b10-11', romaji: 'tasukeru', english: 'to help' },
    { id: 'b10-12', romaji: 'mamoru', english: 'to protect' },
    { id: 'b10-13', romaji: 'tsukuru', english: 'to make' },
    { id: 'b10-14', romaji: 'kowareru', english: 'to break' },
    { id: 'b10-15', romaji: 'naoru', english: 'to heal' },
    { id: 'b10-16', romaji: 'kawaru', english: 'to change' },
    { id: 'b10-17', romaji: 'narau', english: 'to learn' },
    { id: 'b10-18', romaji: 'oshieru', english: 'to teach' },
    { id: 'b10-19', romaji: 'sagasu', english: 'to search' },
    { id: 'b10-20', romaji: 'mitsukeru', english: 'to find' },
  ],
];

const LEVEL_NAMES_A = [
  'Basic Greetings',
  'Numbers',
  'Colors & Adjectives',
  'Food & Drinks',
  'Family',
  'Time & Days',
  'Places',
  'Basic Verbs',
  'Common Phrases',
  'Body & Health',
];

const LEVEL_NAMES_B = [
  'Nature',
  'Animals',
  'Emotions',
  'Weather & Seasons',
  'Work & Study',
  'Transport',
  'Technology',
  'Shopping & Money',
  'Culture & Arts',
  'Advanced Verbs',
];

const QUESTIONS_PER_LEVEL = 20;

// Spaced repetition intervals (in minutes)
const SR_INTERVALS = [1, 5, 25, 120, 600, 2880]; // ~1min, 5min, 25min, 2hr, 10hr, 2days

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Mascot component
function Mascot({ mood }: { mood: 'neutral' | 'happy' | 'thinking' | 'excited' }) {
  const expressions = {
    neutral: '( ・ω・)',
    happy: '(＾▽＾)',
    thinking: '( ・_・)',
    excited: '\\(★ω★)/',
  };

  const messages = {
    neutral: 'Ganbatte! (Do your best!)',
    happy: 'Sugoi! (Amazing!)',
    thinking: 'Mou ikkai! (One more time!)',
    excited: 'Kanpeki! (Perfect!)',
  };

  return (
    <div className="text-center mb-4">
      <div className={cn(
        'text-3xl font-mono mb-1 transition-all',
        (mood === 'happy' || mood === 'excited') && 'mascot-animate'
      )}>
        {expressions[mood]}
      </div>
      <p className="text-xs text-muted-foreground italic">{messages[mood]}</p>
    </div>
  );
}

export default function JapanesePage() {
  const [view, setView] = useState<'quests' | 'level' | 'practice'>('quests');
  const [currentQuest, setCurrentQuest] = useState<Quest>('A');
  const [currentLevel, setCurrentLevel] = useState(1);

  // Level progress state
  const [questAProgress, setQuestAProgress] = useState<LevelProgress[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      questionsAnswered: 0,
      correctAnswers: 0,
      completed: false,
      unlocked: i === 0,
    }))
  );

  const [questBProgress, setQuestBProgress] = useState<LevelProgress[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      questionsAnswered: 0,
      correctAnswers: 0,
      completed: false,
      unlocked: false,
    }))
  );

  // Word progress for spaced repetition
  const [wordProgress, setWordProgress] = useState<Record<string, WordProgress>>({});

  // Practice state
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'thinking' | 'excited'>('neutral');
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const currentWord = practiceWords[currentWordIndex];
  const questProgress = currentQuest === 'A' ? questAProgress : questBProgress;
  const setQuestProgress = currentQuest === 'A' ? setQuestAProgress : setQuestBProgress;
  const questWords = currentQuest === 'A' ? QUEST_A_WORDS : QUEST_B_WORDS;
  const levelNames = currentQuest === 'A' ? LEVEL_NAMES_A : LEVEL_NAMES_B;

  // Check if Quest B is unlocked (all Quest A levels completed)
  const isQuestBUnlocked = questAProgress.every(l => l.completed);

  // Start a level
  const startLevel = (quest: Quest, level: number) => {
    setCurrentQuest(quest);
    setCurrentLevel(level);

    const words = quest === 'A' ? QUEST_A_WORDS[level - 1] : QUEST_B_WORDS[level - 1];

    // Get words that need review based on spaced repetition
    const now = Date.now();
    const wordsToReview = words.filter(w => {
      const progress = wordProgress[w.id];
      if (!progress) return true; // New word
      if (progress.mastered) return false; // Skip mastered
      return progress.nextReview <= now; // Due for review
    });

    // Prioritize words that need review, fill rest with random
    let selectedWords: Word[];
    if (wordsToReview.length >= QUESTIONS_PER_LEVEL) {
      selectedWords = shuffleArray(wordsToReview).slice(0, QUESTIONS_PER_LEVEL);
    } else {
      const remainingWords = words.filter(w => !wordsToReview.includes(w));
      selectedWords = [
        ...shuffleArray(wordsToReview),
        ...shuffleArray(remainingWords).slice(0, QUESTIONS_PER_LEVEL - wordsToReview.length),
      ];
    }

    setPracticeWords(shuffleArray(selectedWords));
    setCurrentWordIndex(0);
    setInput('');
    setShowAnswer(false);
    setResult(null);
    setSessionCorrect(0);
    setSessionTotal(0);
    setMascotMood('neutral');
    setView('practice');
  };

  const checkAnswer = () => {
    if (!currentWord || showAnswer) return;

    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = currentWord.english.toLowerCase();

    // Check for exact or partial match
    const isCorrect = correctAnswer === userAnswer ||
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer.split(' ')[0]);

    setShowAnswer(true);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setSessionTotal(prev => prev + 1);

    if (isCorrect) {
      setSessionCorrect(prev => prev + 1);
      setMascotMood(sessionCorrect >= 14 ? 'excited' : 'happy');
    } else {
      setMascotMood('thinking');
    }

    // Update word progress for spaced repetition
    const now = Date.now();
    setWordProgress(prev => {
      const existing = prev[currentWord.id] || {
        wordId: currentWord.id,
        correctCount: 0,
        incorrectCount: 0,
        lastSeen: now,
        nextReview: now,
        mastered: false,
      };

      const newCorrectCount = existing.correctCount + (isCorrect ? 1 : 0);
      const newIncorrectCount = existing.incorrectCount + (isCorrect ? 0 : 1);

      // Calculate next review time based on spaced repetition
      let intervalIndex = Math.min(newCorrectCount, SR_INTERVALS.length - 1);
      if (!isCorrect) intervalIndex = Math.max(0, intervalIndex - 2);

      const intervalMinutes = SR_INTERVALS[intervalIndex];
      const nextReview = now + intervalMinutes * 60 * 1000;

      // Mastered after 5 consecutive correct answers
      const mastered = newCorrectCount >= 5 && newIncorrectCount === 0;

      return {
        ...prev,
        [currentWord.id]: {
          wordId: currentWord.id,
          correctCount: isCorrect ? newCorrectCount : 0, // Reset on incorrect
          incorrectCount: newIncorrectCount,
          lastSeen: now,
          nextReview,
          mastered,
        },
      };
    });
  };

  const nextWord = () => {
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setInput('');
      setShowAnswer(false);
      setResult(null);
      setMascotMood('neutral');
    } else {
      // Level complete
      completeLevel();
    }
  };

  const completeLevel = () => {
    const accuracy = sessionTotal > 0 ? (sessionCorrect / sessionTotal) * 100 : 0;
    const passed = accuracy >= 70; // Need 70% to pass

    setQuestProgress(prev => prev.map((l, i) => {
      if (i === currentLevel - 1) {
        return {
          ...l,
          questionsAnswered: l.questionsAnswered + sessionTotal,
          correctAnswers: l.correctAnswers + sessionCorrect,
          completed: passed || l.completed,
        };
      }
      // Unlock next level if current passed
      if (i === currentLevel && passed) {
        return { ...l, unlocked: true };
      }
      return l;
    }));

    // If Quest A level 10 completed, unlock Quest B
    if (currentQuest === 'A' && currentLevel === 10 && passed) {
      setQuestBProgress(prev => prev.map((l, i) =>
        i === 0 ? { ...l, unlocked: true } : l
      ));
    }

    setView('level');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAnswer) {
        nextWord();
      } else {
        checkAnswer();
      }
    }
  };

  // Quest Selection View
  if (view === 'quests') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Japanese Learning</h1>
          <p className="text-muted-foreground mt-1">Master 400 essential words with spaced repetition</p>
        </div>

        <div className="grid gap-4">
          {/* Quest A */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:ring-1 hover:ring-primary',
            )}
            onClick={() => { setCurrentQuest('A'); setView('level'); }}
          >
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">A</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Quest A: Foundations</h2>
                    <p className="text-sm text-muted-foreground">200 essential words across 10 levels</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {questAProgress.filter(l => l.completed).length}/10
                  </p>
                  <p className="text-xs text-muted-foreground">levels complete</p>
                </div>
              </div>
              <Progress
                value={(questAProgress.filter(l => l.completed).length / 10) * 100}
                className="mt-4 h-2"
              />
            </CardContent>
          </Card>

          {/* Quest B */}
          <Card
            className={cn(
              'transition-all',
              isQuestBUnlocked
                ? 'cursor-pointer hover:ring-1 hover:ring-primary'
                : 'opacity-60'
            )}
            onClick={() => isQuestBUnlocked && (setCurrentQuest('B'), setView('level'))}
          >
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-14 w-14 rounded-xl flex items-center justify-center',
                    isQuestBUnlocked ? 'bg-amber-500/10' : 'bg-muted'
                  )}>
                    {isQuestBUnlocked ? (
                      <span className="text-2xl font-bold text-amber-500">B</span>
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Quest B: Advanced</h2>
                    <p className="text-sm text-muted-foreground">
                      {isQuestBUnlocked
                        ? '200 advanced words across 10 levels'
                        : 'Complete Quest A to unlock'}
                    </p>
                  </div>
                </div>
                {isQuestBUnlocked && (
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {questBProgress.filter(l => l.completed).length}/10
                    </p>
                    <p className="text-xs text-muted-foreground">levels complete</p>
                  </div>
                )}
              </div>
              {isQuestBUnlocked && (
                <Progress
                  value={(questBProgress.filter(l => l.completed).length / 10) * 100}
                  className="mt-4 h-2"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{Object.keys(wordProgress).length}</p>
                <p className="text-xs text-muted-foreground">Words Learned</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(wordProgress).filter(w => w.mastered).length}
                </p>
                <p className="text-xs text-muted-foreground">Mastered</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {questAProgress.filter(l => l.completed).length + questBProgress.filter(l => l.completed).length}
                </p>
                <p className="text-xs text-muted-foreground">Levels Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Selection View
  if (view === 'level') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView('quests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Quest {currentQuest}: {currentQuest === 'A' ? 'Foundations' : 'Advanced'}
            </h1>
            <p className="text-sm text-muted-foreground">Select a level to practice</p>
          </div>
        </div>

        <div className="grid gap-3">
          {questProgress.map((level, index) => {
            const levelWords = questWords[index];
            const masteredCount = levelWords.filter(w => wordProgress[w.id]?.mastered).length;

            return (
              <Card
                key={level.level}
                className={cn(
                  'transition-all',
                  level.unlocked
                    ? 'cursor-pointer hover:ring-1 hover:ring-primary'
                    : 'opacity-50'
                )}
                onClick={() => level.unlocked && startLevel(currentQuest, level.level)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center font-bold',
                        level.completed
                          ? 'bg-primary text-primary-foreground'
                          : level.unlocked
                            ? 'bg-secondary text-foreground'
                            : 'bg-muted text-muted-foreground'
                      )}>
                        {level.unlocked ? (
                          level.completed ? <Check className="h-5 w-5" /> : level.level
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Level {level.level}: {levelNames[index]}</h3>
                        <p className="text-xs text-muted-foreground">
                          {masteredCount}/20 words mastered
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {level.completed && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Trophy className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {level.unlocked && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Practice View
  if (!currentWord) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setView('level')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">
            Quest {currentQuest} - Level {currentLevel}
          </p>
          <p className="text-xs text-muted-foreground">{levelNames[currentLevel - 1]}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{sessionCorrect}/{sessionTotal}</p>
          <p className="text-xs text-muted-foreground">correct</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={((currentWordIndex + 1) / practiceWords.length) * 100} className="h-2" />

      {/* Mascot */}
      <Mascot mood={mascotMood} />

      {/* Flashcard */}
      <Card>
        <CardContent className="py-10 px-8">
          <div className="text-center space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Romaji
              </p>
              <p className="text-3xl font-semibold font-heading">
                {currentWord.romaji}
              </p>
            </div>

            {showAnswer && (
              <div className={cn(
                'flex items-center justify-center gap-2 text-lg py-3 px-4 rounded-lg animate-scale-in',
                result === 'correct' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
              )}>
                {result === 'correct' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span className="font-medium">{currentWord.english}</span>
              </div>
            )}

            <div className="max-w-sm mx-auto space-y-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the English meaning..."
                disabled={showAnswer}
                className="text-center text-lg h-12"
                autoFocus
              />

              {showAnswer ? (
                <Button onClick={nextWord} className="w-full h-11">
                  {currentWordIndex < practiceWords.length - 1 ? 'Next Word' : 'Complete Level'}
                </Button>
              ) : (
                <Button onClick={checkAnswer} disabled={!input.trim()} className="w-full h-11">
                  Check Answer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress indicator */}
      <p className="text-center text-sm text-muted-foreground">
        Question {currentWordIndex + 1} of {practiceWords.length}
      </p>
    </div>
  );
}
