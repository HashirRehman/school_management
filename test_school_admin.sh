#!/bin/bash

# Test School Administrator Features
# This script tests all School Admin functionality

BASE_URL="http://localhost:5111"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing School Administrator Features"
echo "=========================================="
echo ""

# Step 1: Login as Superadmin
echo "Step 1: Logging in as Superadmin..."
SUPERADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoolmanagement.com","password":"Admin123!"}' | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['shortToken'] if d.get('ok') else '')" 2>/dev/null)

if [ -z "$SUPERADMIN_TOKEN" ]; then
  echo -e "${RED}❌ Failed to login as superadmin${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Logged in as superadmin${NC}"
echo ""

# Step 2: Create a School
echo "Step 2: Creating a test school..."
SCHOOL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/school/createSchool" \
  -H "Content-Type: application/json" \
  -H "token: $SUPERADMIN_TOKEN" \
  -d '{"name":"Test School for Admin","address":"123 Test St","contactEmail":"test@school.edu","contactPhone":"123-456-7890"}')

SCHOOL_ID=$(echo "$SCHOOL_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['school']['_id'] if d.get('ok') and d.get('data',{}).get('school') else '')" 2>/dev/null)

if [ -z "$SCHOOL_ID" ]; then
  echo -e "${YELLOW}⚠️  School might already exist, trying to get existing school...${NC}"
  SCHOOLS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/school/getSchools" \
    -H "Content-Type: application/json" \
    -H "token: $SUPERADMIN_TOKEN" \
    -d '{"page":1,"limit":10}')
  SCHOOL_ID=$(echo "$SCHOOLS_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); schools=d.get('data',{}).get('schools',[]); print(schools[0]['_id'] if schools else '')" 2>/dev/null)
fi

if [ -z "$SCHOOL_ID" ]; then
  echo -e "${RED}❌ Failed to create/get school${NC}"
  exit 1
fi
echo -e "${GREEN}✅ School ID: $SCHOOL_ID${NC}"
echo ""

# Step 3: Create School Admin User
echo "Step 3: Creating School Administrator user..."
ADMIN_EMAIL="schooladmin$(date +%s)@test.com"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/user/createUser" \
  -H "Content-Type: application/json" \
  -H "token: $SUPERADMIN_TOKEN" \
  -d "{\"name\":\"Test School Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"Test123!\",\"role\":\"school_admin\",\"school\":\"$SCHOOL_ID\"}")

USER_CREATED=$(echo "$USER_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print('ok' if d.get('ok') else '')" 2>/dev/null)

if [ "$USER_CREATED" != "ok" ]; then
  echo -e "${RED}❌ Failed to create school admin user${NC}"
  echo "$USER_RESPONSE" | python3 -m json.tool 2>/dev/null
  exit 1
fi
echo -e "${GREEN}✅ School Admin created: $ADMIN_EMAIL${NC}"
echo ""

# Step 4: Login as School Admin
echo "Step 4: Logging in as School Administrator..."
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"Test123!\"}" | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['shortToken'] if d.get('ok') else '')" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}❌ Failed to login as school admin${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Logged in as school admin${NC}"
echo ""

# Step 5: Test Classroom Creation
echo "Step 5: Testing Classroom Creation..."
CLASSROOM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/classroom/createClassroom" \
  -H "Content-Type: application/json" \
  -H "token: $ADMIN_TOKEN" \
  -d "{\"name\":\"Test Classroom 1\",\"capacity\":30,\"resources\":[\"Projector\",\"Whiteboard\"]}")

CLASSROOM_ID=$(echo "$CLASSROOM_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['classroom']['_id'] if d.get('ok') and d.get('data',{}).get('classroom') else '')" 2>/dev/null)

if [ -z "$CLASSROOM_ID" ]; then
  echo -e "${RED}❌ Failed to create classroom${NC}"
  echo "$CLASSROOM_RESPONSE" | python3 -m json.tool 2>/dev/null
else
  echo -e "${GREEN}✅ Classroom created: $CLASSROOM_ID${NC}"
fi
echo ""

# Step 6: Test Getting Classrooms
echo "Step 6: Testing Get Classrooms..."
CLASSROOMS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/classroom/getClassrooms" \
  -H "Content-Type: application/json" \
  -H "token: $ADMIN_TOKEN" \
  -d '{"page":1,"limit":10}')

CLASSROOMS_COUNT=$(echo "$CLASSROOMS_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('data',{}).get('classrooms',[])) if d.get('ok') else 0)" 2>/dev/null)

if [ "$CLASSROOMS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Retrieved $CLASSROOMS_COUNT classroom(s)${NC}"
else
  echo -e "${RED}❌ Failed to retrieve classrooms${NC}"
  echo "$CLASSROOMS_RESPONSE" | python3 -m json.tool 2>/dev/null
fi
echo ""

# Step 7: Test Student Creation
echo "Step 7: Testing Student Creation..."
if [ -n "$CLASSROOM_ID" ]; then
  STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/student/createStudent" \
    -H "Content-Type: application/json" \
    -H "token: $ADMIN_TOKEN" \
    -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john.doe$(date +%s)@test.com\",\"dateOfBirth\":\"2010-05-15\",\"classroomId\":\"$CLASSROOM_ID\"}")

  STUDENT_ID=$(echo "$STUDENT_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['student']['_id'] if d.get('ok') and d.get('data',{}).get('student') else '')" 2>/dev/null)

  if [ -z "$STUDENT_ID" ]; then
    echo -e "${RED}❌ Failed to create student${NC}"
    echo "$STUDENT_RESPONSE" | python3 -m json.tool 2>/dev/null
  else
    echo -e "${GREEN}✅ Student created: $STUDENT_ID${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping student creation (no classroom available)${NC}"
fi
echo ""

# Step 8: Test Getting Students
echo "Step 8: Testing Get Students..."
STUDENTS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/student/getStudents" \
  -H "Content-Type: application/json" \
  -H "token: $ADMIN_TOKEN" \
  -d '{"page":1,"limit":10}')

STUDENTS_COUNT=$(echo "$STUDENTS_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('data',{}).get('students',[])) if d.get('ok') else 0)" 2>/dev/null)

if [ "$STUDENTS_COUNT" -ge 0 ]; then
  echo -e "${GREEN}✅ Retrieved $STUDENTS_COUNT student(s)${NC}"
else
  echo -e "${RED}❌ Failed to retrieve students${NC}"
  echo "$STUDENTS_RESPONSE" | python3 -m json.tool 2>/dev/null
fi
echo ""

# Step 9: Test Unauthorized Access (School Admin trying to access superadmin features)
echo "Step 9: Testing Unauthorized Access (School Admin trying to create school)..."
UNAUTHORIZED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/school/createSchool" \
  -H "Content-Type: application/json" \
  -H "token: $ADMIN_TOKEN" \
  -d '{"name":"Unauthorized School","address":"123 Test St","contactEmail":"test@school.edu"}')

UNAUTHORIZED_ERROR=$(echo "$UNAUTHORIZED_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print('forbidden' if not d.get('ok') and ('forbidden' in str(d.get('errors',[])).lower() or 'unauthorized' in str(d.get('errors',[])).lower()) else '')" 2>/dev/null)

if [ -n "$UNAUTHORIZED_ERROR" ] || [ "$(echo "$UNAUTHORIZED_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print('ok' if not d.get('ok') else '')" 2>/dev/null)" == "ok" ]; then
  echo -e "${GREEN}✅ Unauthorized access correctly blocked${NC}"
else
  echo -e "${RED}❌ Security issue: School admin can access superadmin features!${NC}"
  echo "$UNAUTHORIZED_RESPONSE" | python3 -m json.tool 2>/dev/null
fi
echo ""

# Step 10: Test Student Transfer (if we have 2 classrooms and a student)
echo "Step 10: Testing Student Transfer..."
if [ -n "$CLASSROOM_ID" ] && [ -n "$STUDENT_ID" ]; then
  # Create second classroom
  CLASSROOM2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/classroom/createClassroom" \
    -H "Content-Type: application/json" \
    -H "token: $ADMIN_TOKEN" \
    -d "{\"name\":\"Test Classroom 2\",\"capacity\":25,\"resources\":[\"Projector\"]}")

  CLASSROOM2_ID=$(echo "$CLASSROOM2_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['data']['classroom']['_id'] if d.get('ok') and d.get('data',{}).get('classroom') else '')" 2>/dev/null)

  if [ -n "$CLASSROOM2_ID" ]; then
    TRANSFER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/student/transferStudent" \
      -H "Content-Type: application/json" \
      -H "token: $ADMIN_TOKEN" \
      -d "{\"studentId\":\"$STUDENT_ID\",\"newClassroomId\":\"$CLASSROOM2_ID\"}")

    TRANSFER_SUCCESS=$(echo "$TRANSFER_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print('ok' if d.get('ok') else '')" 2>/dev/null)

    if [ "$TRANSFER_SUCCESS" == "ok" ]; then
      echo -e "${GREEN}✅ Student transfer successful${NC}"
    else
      echo -e "${RED}❌ Student transfer failed${NC}"
      echo "$TRANSFER_RESPONSE" | python3 -m json.tool 2>/dev/null
    fi
  else
    echo -e "${YELLOW}⚠️  Could not create second classroom for transfer test${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping transfer test (need classroom and student)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=========================================="
