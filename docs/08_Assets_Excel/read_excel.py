import json
import openpyxl

try:
    # 엑셀 파일 로드
    wb = openpyxl.load_workbook("2026년-일용직-노임대장-양식v1.xlsx", data_only=False)
    sheet = wb.active # 첫 번째 시트 선택
    output = {
        "sheet_name": sheet.title,
        "rows": []
    }
    
    # 처음 15줄을 읽어 각 칸에 어떤 값이 들어있는지 확인
    for row in sheet.iter_rows(min_row=1, max_row=15, values_only=False):
        row_data = []
        for cell in row:
            val = cell.value if cell.value is not None else ""
            row_data.append(str(val))
        output["rows"].append(row_data)

    print("\n=== 🎯 [엑셀 파싱 성공] ===")
    
    # JSON 파일로도 저장
    with open("excel_layout.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("▶ 현재 폴더에 'excel_layout.json' 파일이 생성되었습니다.")
    print("이 폴더의 'excel_layout.json' 파일을 열어서 저에게 복사해 주시거나, 내용을 캡처해서 보여주시면 완벽한 코딩을 진행할 수 있습니다!")
    
except Exception as e:
    print(f"Error: 엑셀 파일을 읽는 도중 오류가 발생했습니다: {e}")
