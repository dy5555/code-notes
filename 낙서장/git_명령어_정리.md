# Git 명령어 정리 (자주 쓰는 순서)

---

## 매일 쓰는 것

### 1. `git status`
지금 내 작업 폴더 상태를 보여줍니다. 어떤 파일을 수정했는지, add 했는지, 현재 브랜치가 뭔지 나옵니다.
다른 명령어 치기 전에 습관적으로 확인하는 용도입니다.
```
git status
```

### 2. `git add`
수정한 파일을 "이번 커밋에 넣을 목록(스테이징)"에 올립니다. add 안 한 파일은 커밋되지 않습니다.
```
git add UserService.java   # 파일 하나만
git add .                  # 변경된 파일 전부
```

### 3. `git commit`
add한 파일들을 하나의 저장 지점으로 기록합니다. 아직 내 PC에만 저장되고, 서버에는 안 올라갑니다.
```
git commit -m "로그인 화면 유효성 검사 추가"
```

### 4. `git pull`
서버(원격 저장소)의 최신 내용을 받아서 내 브랜치에 합칩니다.
작업 시작 전, push 전에 먼저 해서 충돌을 줄입니다.
```
git pull origin develop
```

### 5. `git push`
내 PC의 커밋을 서버에 올립니다. 이걸 해야 다른 사람이 내 작업을 볼 수 있습니다.
```
git push origin feature/login
```

### 6. `git checkout` / `git switch`
다른 브랜치로 이동합니다. `switch`는 브랜치 전환 전용으로 나중에 나온 명령어라 더 직관적입니다.
```
git switch develop              # 기존 브랜치로 이동
git switch -c feature/login     # 새 브랜치 만들면서 이동
git checkout develop            # 예전 방식 (같은 동작)
```

### 7. `git branch`
브랜치 목록을 보거나, 만들거나, 지웁니다.
```
git branch                  # 목록 (현재 브랜치에 *)
git branch --show-current   # 현재 브랜치 이름만
git branch feature/login    # 새 브랜치 생성 (이동은 안 함)
git branch -d feature/login # 브랜치 삭제
```

---

## 자주 쓰는 것

### 8. `git log`
커밋 이력을 봅니다. 누가, 언제, 무슨 커밋을 했는지 확인할 때 씁니다. 종료는 `q`입니다.
```
git log --oneline       # 한 줄씩 간단하게
git log --oneline -10   # 최근 10개만
```

### 9. `git diff`
커밋하기 전에 정확히 어떤 줄이 바뀌었는지 비교합니다.
```
git diff            # add 안 한 변경 내용
git diff --staged   # add 한 변경 내용
```

### 10. `git merge`
다른 브랜치의 작업을 현재 브랜치에 합칩니다. 기능 개발 끝나고 develop에 합칠 때 씁니다.
```
git switch develop
git merge feature/login
```

### 11. `git fetch`
서버의 최신 정보를 받아오기만 하고 내 코드에는 합치지 않습니다.
"뭐가 바뀌었는지 먼저 보고 싶을 때" 씁니다. `pull` = `fetch` + `merge`입니다.
```
git fetch origin
```

### 12. `git stash`
작업 중인 코드를 커밋하지 않고 잠깐 치워둡니다. 급하게 다른 브랜치로 가야 할 때 유용합니다.
```
git stash        # 임시 보관
git stash list   # 보관 목록
git stash pop    # 다시 꺼내기
```

---

## 가끔 쓰는 것

### 13. `git clone`
서버 저장소를 내 PC에 처음 통째로 내려받습니다. 프로젝트 처음 세팅할 때 한 번 씁니다.
```
git clone https://서버주소/프로젝트.git
```

### 14. `git reset`
커밋이나 add를 취소합니다. `--hard`는 수정 내용까지 날아가니 조심해야 합니다.
```
git reset HEAD 파일명     # add 취소
git reset --soft HEAD~1  # 마지막 커밋 취소 (수정 내용은 유지)
git reset --hard HEAD~1  # 마지막 커밋 + 수정 내용 모두 삭제 (주의!)
```

### 15. `git restore`
수정한 파일을 마지막 커밋 상태로 되돌립니다. "이 파일 괜히 건드렸다" 싶을 때 씁니다.
```
git restore UserService.java          # 수정 내용 취소
git restore --staged UserService.java # add만 취소
```

### 16. `git rebase`
내 브랜치의 커밋들을 다른 브랜치 최신 지점 위로 옮겨 붙입니다.
이력이 한 줄로 깔끔해지지만, 이미 push한 브랜치에 쓰면 꼬일 수 있어 주의가 필요합니다.
```
git rebase develop
```

### 17. `git cherry-pick`
다른 브랜치의 특정 커밋 하나만 골라서 가져옵니다. 커밋 ID는 `git log`로 확인합니다.
```
git cherry-pick a1b2c3d
```

---

## 일반적인 하루 흐름
```
git switch develop
git pull origin develop
git switch -c feature/login
(코드 작업)
git status
git add .
git commit -m "로그인 기능 추가"
git push origin feature/login
```

---

## 현재 브랜치 확인 (IDE별)
- **터미널 공통**: `git branch --show-current` 또는 `git branch` (`*` 표시)
- **VS Code**: 왼쪽 아래 상태바 / 소스 제어 탭 (`Ctrl + Shift + G`)
- **IntelliJ 새 UI**: 왼쪽 위 프로젝트명 옆
- **IntelliJ 클래식 UI**: 오른쪽 아래 상태바
- **IntelliJ 터미널**: `Alt + F12`
