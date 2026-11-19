import { useState, useRef, useEffect } from 'react'
import { calculateRecommendations } from './nesting'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [voiceEnabled, setVoiceEnabled] = useState(true)


  // 원단 입력 정보
  const [fabricImage, setFabricImage] = useState(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [material, setMaterial] = useState('')
  const [customMaterial, setCustomMaterial] = useState('')
  const [quantity, setQuantity] = useState(1)

  // 내가 저장한 원단 디자인
  const [savedDesigns, setSavedDesigns] = useState([])

  // 시연용 로그인
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 시연용 채팅 상대
  const [chatProduct, setChatProduct] = useState('업사이클 제품')

  // 분석 결과
  const [recommendations, setRecommendations] = useState([])

  const fileInputRef = useRef(null)

// 현재 화면에서 읽어줄 안내 문구
  const voiceMessages = {
  home: '리펄스 홈 화면입니다. 남겨진 원단에 새로운 쓰임을. 원단 분석을 시작할 수 있습니다.',
  market: '마켓 화면입니다. 업사이클링 제품을 둘러보고 구매 문의를 할 수 있습니다.',
  analysis: '원단 분석 화면입니다. 원단 사진과 가로, 세로 크기, 소재와 수량을 입력해 주세요.',
  result: '원단 분석 결과 화면입니다. 추천 도안과 예상 원단 사용률을 확인할 수 있습니다.',
  my: '마이페이지입니다. 사용자 정보와 접근성 설정을 확인할 수 있습니다.',
}

// 음성 재생 함수
const speak = (message) => {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(message)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.9
  utterance.pitch = 1

  window.speechSynthesis.speak(utterance)
}

// 화면이 바뀌면 음성 안내
useEffect(() => {
  if (!voiceEnabled) {
    window.speechSynthesis?.cancel()
    return
  }

  speak(voiceMessages[page])

  return () => {
    window.speechSynthesis?.cancel()
  }
}, [page, voiceEnabled])

// 음성 안내 ON/OFF
const toggleVoice = () => {
  setVoiceEnabled((previous) => !previous)
}


  // 사진 업로드
  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WEBP 이미지만 등록할 수 있습니다.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setFabricImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  // 도안 배치 계산
  const handleAnalyze = () => {
    const w = Number(width)
    const h = Number(height)
    const q = Number(quantity)

    if (!fabricImage) {
      alert('원단 사진을 먼저 등록해 주세요.')
      return
    }

    if (
      !width || !height ||
      !Number.isFinite(w) ||
      !Number.isFinite(h) ||
      w < 1 || h < 1 ||
      w > 300 || h > 300
    ) {
      alert('가로와 세로를 1~300cm 사이로 입력해 주세요.')
      return
    }

    if (!material) {
      alert('원단 소재를 선택해 주세요.')
      return
    }
    if (material === 'other' && !customMaterial.trim()) {
      alert('기타 원단 소재를 입력해 주세요.')
      return
    }


    if (
      !Number.isInteger(q) ||
      q < 1 || q > 100
    ) {
      alert('원단 수량을 1~100개 사이로 입력해 주세요.')
      return
    }

    const result = calculateRecommendations(w, h, q)
    setRecommendations(result)
    setPage('result')
    window.scrollTo(0, 0)
  }

  // 현재 분석 결과를 내 디자인에 저장
  const saveDesign = () => {
    if (recommendations.length === 0) return

    const newDesign = {
      id: Date.now(),
      image: fabricImage,
      width,
      height,
      material: material === 'other'
        ? customMaterial.trim()
        : material,
      quantity,
      recommendations: recommendations.map((item) => ({ ...item })),
    }

    setSavedDesigns((previous) => [
      newDesign,
      ...previous,
    ])

    alert('내 디자인에 저장되었습니다.')
    setPage('designs')
    window.scrollTo(0, 0)
  }


  return (
    <div className="app">

      {/* 공통 헤더 */}
      <header className="header">
        <h1>Re:Pulse<span>.</span></h1>
        <button
        className={`voice-button ${voiceEnabled ? 'voice-active' : ''}`}
        type="button"
        onClick={toggleVoice}
        aria-pressed={voiceEnabled}
        aria-label={`음성 안내 ${voiceEnabled ? '끄기' : '켜기'}`}
        >
        {voiceEnabled ? '음성 끄기' : '음성 켜기'}
    </button>

      </header>

      <main>

        {/* 홈 화면 */}
        {page === 'home' && (
          <>
            <section className="intro">
              <p className="eyebrow">REMAKE WHAT REMAINS</p>
              <h2>
                남겨진 원단에<br />
                새로운 쓰임을.
              </h2>
              <p className="description">
                버려질 뻔한 원단이 새로운 디자인이 되는 곳.
              </p>
            </section>

            <section className="feature">
              <p className="feature-label">FABRIC STUDIO</p>
              <h3>
                이 원단으로<br />
                무엇을 만들 수 있을까요?
              </h3>
              <p>원단의 가능성을 발견해 보세요.</p>
              <button
                type="button"
                onClick={() => setPage('analysis')}
              >
                원단 분석 시작하기 →
              </button>
            </section>
          </>
        )}


{/* 마켓 화면 */}
{page === 'market' && (
  <section className="sub-page market-page">
    <p className="eyebrow">REPULSE MARKET</p>
    <h2>다시 쓰이는 것들의 가치.</h2>
    <p className="description">
      버려질 뻔한 원단이 새로운 제품으로 태어났어요.
    </p>

    <div className="market-list">
      {[
        { id: 1, name: '패브릭 키링', price: '8,000원', type: 'ACCESSORY', symbol: '✳' },
        { id: 2, name: '업사이클 파우치', price: '15,000원', type: 'POUCH', symbol: '▧' },
        { id: 3, name: '리메이드 카드지갑', price: '12,000원', type: 'WALLET', symbol: '▤' },
        { id: 4, name: '패치워크 에코백', price: '25,000원', type: 'BAG', symbol: '▥' },
      ].map((product) => (
        <article className="product-card" key={product.id}>
          <div className="product-image" aria-hidden="true">
            <span>{product.symbol}</span>
          </div>

          <div className="product-info">
            <small>{product.type}</small>
            <h3>{product.name}</h3>
            <strong>{product.price}</strong>
            <button
              type="button"
  
              onClick={() => {
                setChatProduct(product.name)
                setPage('chat')
              }}
              
            >
              구매 문의하기 →
            </button>
          </div>
        </article>
      ))}
    </div>
    <p className="market-notice">
      현재 상품은 MVP 시연을 위한 예시이며
      실제 판매 및 결제는 지원하지 않습니다.
    </p>
  </section>
)}


        {/* 원단 입력 화면 */}
        {page === 'analysis' && (
          <section className="sub-page analysis-page">
            <p className="eyebrow">FABRIC STUDIO / 01</p>
            <h2>원단을 등록해 주세요.</h2>
            <p className="description">
              사진과 크기를 입력하면 제작 가능한 제품을
              찾아드려요.
            </p>

            <div className="upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="upload-box"
                onClick={() => fileInputRef.current?.click()}
              >
                {fabricImage ? (
                  <img
                    src={fabricImage}
                    alt="선택한 원단 사진 미리보기"
                    className="fabric-preview"
                  />
                ) : (
                  <>
                    <span className="upload-icon">＋</span>
                    <strong>원단 사진 선택하기</strong>
                    <small>JPG, PNG, WEBP</small>
                  </>
                )}
              </button>

              {fabricImage && (
                <p className="upload-hint">
                  사진을 변경하려면 이미지를 다시 눌러주세요.
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fabric-width">가로 (cm)</label>
                <input
                  id="fabric-width"
                  type="number"
                  min="1"
                  max="300"
                  step="any"
                  placeholder="예: 30"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fabric-height">세로 (cm)</label>
                <input
                  id="fabric-height"
                  type="number"
                  min="1"
                  max="300"
                  step="any"
                  placeholder="예: 40"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              
              <label htmlFor="fabric-material">원단 소재</label>

              <select
                id="fabric-material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="">소재 선택</option>
                <option value="면">면 (Cotton)</option>
                <option value="린넨">린넨 (Linen)</option>
                <option value="데님">데님 (Denim)</option>
                <option value="폴리에스터">폴리에스터</option>
                <option value="나일론">나일론</option>
                <option value="실크">실크 (Silk)</option>
                <option value="울">울 (Wool)</option>
                <option value="니트">니트</option>
                <option value="벨벳">벨벳</option>
                <option value="코듀로이">코듀로이</option>
                <option value="캔버스">캔버스</option>
                <option value="가죽">가죽</option>
                <option value="합성가죽">합성가죽</option>
                <option value="혼방">혼방 소재</option>
                <option value="other">기타 (직접 입력)</option>
              </select>

              {material === 'other' && (
                <input
                  type="text"
                  placeholder="원단 소재를 직접 입력해 주세요"
                  aria-label="기타 원단 소재"
                  value={customMaterial}
                  maxLength={40}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                />
              )}

            </div>

            <div className="form-group">
              <label htmlFor="fabric-quantity">
                원단 수량 (조각)
              </label>
              <input
                id="fabric-quantity"
                type="number"
                min="1"
                max="100"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
            >
              원단 분석하기 →
            </button>
          </section>
        )}

        {/* 분석 결과 화면 */}
        {page === 'result' && (
          <section className="result-page">
            <p className="eyebrow">FABRIC STUDIO / 02</p>
            <h2>원단 분석 결과</h2>
            <p className="result-description">
              입력하신 원단 크기를 바탕으로
              도안 배치를 계산했어요.
            </p>

            <div className="fabric-summary">
              {fabricImage && (
                <img
                  src={fabricImage}
                  alt="분석한 원단"
                />
              )}
              <div>
                <span>등록한 원단</span>
                <strong>{width} × {height}cm</strong>
                <small>{quantity}장 · 직사각형 기준</small>
              </div>
            </div>

            <div className="result-heading">
              <h3>추천 도안</h3>
              <span>사용률 높은 순</span>
            </div>

            {recommendations.map((item) => (
              <article className="result-card" key={item.id}>
                <div className="result-card-top">
                  <div>
                    <p className="result-label">
                      {item.possible ? '제작 가능' : '제작 불가'}
                    </p>
                    <h4>{item.name}</h4>
                    <span>
                      도안 크기 {item.width} × {item.height}cm
                    </span>
                  </div>

                  <div className="usage-value">
                    <strong>{item.usage.toFixed(1)}%</strong>
                    <small>예상 사용률</small>
                  </div>
                </div>

                {item.possible ? (
                  <>
                    <div className="layout-preview">
                      <svg
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="xMidYMid meet"
                        role="img"
                        aria-label={`${item.name} 도안 ${item.count}개 배치 예시`}
                      >
                        <rect
                          x="0"
                          y="0"
                          width={Number(width)}
                          height={Number(height)}
                          fill="#EAEDE5"
                        />

                        {Array.from(
                          { length: item.rows },
                          (_, row) =>
                            Array.from(
                              { length: item.columns },
                              (_, col) => (
                                <rect
                                  key={`${row}-${col}`}
                                  x={col * item.itemWidth + 0.2}
                                  y={row * item.itemHeight + 0.2}
                                  width={Math.max(
                                    item.itemWidth - 0.4, 0.1
                                  )}
                                  height={Math.max(
                                    item.itemHeight - 0.4, 0.1
                                  )}
                                  fill="#A7BDA9"
                                  stroke="#294B3A"
                                  strokeWidth="0.15"
                                />
                              )
                            )
                        )}
                      </svg>
                    </div>

                    <div className="layout-info">
                      <span>1장당 도안 {item.count}개</span>
                      <strong>총 {item.totalCount}개</strong>
                    </div>

                    {item.rotated && (
                      <p className="rotation-note">
                        도안을 90° 회전하여 배치했어요.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="unavailable">
                    이 원단에서는 해당 크기의 도안을
                    배치할 수 없어요.
                  </p>
                )}
              </article>
            ))}

            <button
              type="button"
              className="analyze-button"
              onClick={saveDesign}
            >
              내 디자인에 저장하기 →
            </button>


            <p className="result-notice">
              ※ 직사각형 격자 배치 시뮬레이션입니다.
              재단 여유분과 봉제 시접은 반영되지 않았으며,
              최적 배치를 보장하지 않습니다.
            </p>

            <button
              type="button"
              className="analyze-button"
              onClick={() => setPage('analysis')}
            >
              원단 정보 수정하기
            </button>
          </section>
        )}

          
      {/* 저장한 디자인 화면 */}
      {page === 'designs' && (
        <section className="sub-page saved-page">
          <p className="eyebrow">MY DESIGN ARCHIVE</p>
          <h2>나의 디자인</h2>
          <p className="description">
            내가 분석하고 저장한 원단 도안을 모아볼 수 있어요.
          </p>

          {savedDesigns.length === 0 ? (
            <div className="empty-box">
              아직 저장한 디자인이 없습니다.
            </div>
          ) : (
            <div className="saved-list">
              {savedDesigns.map((design) => (
                <article className="saved-card" key={design.id}>
                  <img
                    src={design.image}
                    alt="저장한 원단"
                  />

                  <div>
                    <small>{design.material}</small>
                    <h3>
                      원단 {design.width} × {design.height}cm
                    </h3>
                    <p>수량 {design.quantity}장</p>

                    <p>
                      추천 도안:{' '}
                      {design.recommendations
                        .filter((item) => item.possible)
                        .map((item) => item.name)
                        .join(', ') || '없음'}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSavedDesigns((previous) =>
                          previous.filter(
                            (item) => item.id !== design.id
                          )
                        )
                      }}
                    >
                      삭제하기
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <button
            type="button"
            className="archive-back"
            onClick={() => setPage('my')}
          >
            ← 마이페이지로 돌아가기
          </button>
        </section>
      )}


        
{/* MY 화면 */}
{page === 'my' && (
  <section className="sub-page my-page">
    <p className="eyebrow">MY REPULSE</p>
    <h2>마이페이지</h2>

    <div className="my-profile">
      {isLoggedIn ? (
        <>
          <div>
            <h3>Re:Pulse 메이커</h3>
            <p>환영합니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsLoggedIn(false)}
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <div>
            <h3>로그인이 필요해요.</h3>
            <p>내 디자인과 메시지를 관리해 보세요.</p>
          </div>
          <button
            type="button"
            onClick={() => setPage('login')}
          >
            로그인
          </button>
        </>
      )}
    </div>

    <div className="my-menu">
      <button
        type="button"
        onClick={() => setPage('designs')}
      >
        나의 디자인
        <span>→</span>
      </button>

      <button
        type="button"
        onClick={() => setPage('chat')}
      >
        메시지
        <span>→</span>
      </button>

      <button
        type="button"
        onClick={() => setPage('login')}
      >
        계정 관리
        <span>→</span>
      </button>
    </div>

    <p className="demo-notice">
      로그인 및 계정 기능은 MVP 시연용입니다.
    </p>
  </section>
)}

    {/* 시연용 로그인 화면 */}
    {page === 'login' && (
      <section className="sub-page login-page">
        <p className="eyebrow">WELCOME BACK</p>
        <h2>Re:Pulse 로그인</h2>
        <p className="description">
          나만의 업사이클링 작업을 시작해 보세요.
        </p>

        <form onSubmit={(e) => {
          e.preventDefault()
          setIsLoggedIn(true)
          setPage('my')
        }}>
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            placeholder="example@email.com"
            autoComplete="off"
            required
          />

          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            placeholder="비밀번호 입력"
            autoComplete="off"
            required
          />

          <button type="submit" className="analyze-button">
            로그인하기
          </button>
        </form>

        <p className="demo-notice">
          시연용 화면입니다. 입력한 정보는 인증하거나
          서버에 전송하지 않습니다. 실제 비밀번호를
          입력하지 마세요.
        </p>

        <button
          type="button"
          className="archive-back"
          onClick={() => setPage('my')}
        >
          ← 돌아가기
        </button>
      </section>
    )}
    {/* 시연용 채팅 화면 */}
    {page === 'chat' && (
      <section className="chat-page">
        <button
          type="button"
          className="archive-back"
          onClick={() => setPage('my')}
        >
          ← 돌아가기
        </button>

        <div className="chat-header">
          <div className="chat-avatar">R</div>
          <div>
            <h3>Re:Pulse 제작자</h3>
            <p>{chatProduct} · 시연용 대화</p>
          </div>
        </div>

        <div className="chat-messages">
          <div className="chat-bubble received">
            안녕하세요! 어떤 제품에 대해 문의하시나요?
          </div>

          <div className="chat-bubble sent">
            안녕하세요. 이 제품을 다른 색상으로
            제작할 수 있을까요?
          </div>

          <div className="chat-bubble received">
            네, 보유하고 있는 자투리 원단에 따라
            색상 변경이 가능합니다.
          </div>

          <div className="chat-bubble sent">
            제작 기간은 어느 정도 걸리나요?
          </div>

          <div className="chat-bubble received">
            원단과 디자인 확인 후 안내해 드릴 수 있어요!
          </div>
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="MVP 시연용 · 메시지 전송 불가"
            disabled
            aria-label="비활성화된 채팅 입력창"
          />
          <button type="button" disabled>
            전송
          </button>
        </div>

        <p className="demo-notice">
          실제 채팅 서버는 연결되지 않았습니다.
        </p>
      </section>
    )}



      </main>
    
      {/* 하단 메뉴 */}
      <nav className="bottom-nav" aria-label="하단 메뉴">
        <button
          type="button"
          className={page === 'home' ? 'active' : ''}
          onClick={() => setPage('home')}
          aria-current={page === 'home' ? 'page' : undefined}
        >
          홈
        </button>

        <button
          type="button"
          className={page === 'market' ? 'active' : ''}
          onClick={() => setPage('market')}
          aria-current={page === 'market' ? 'page' : undefined}
        >
          마켓
        </button>

        <button
          type="button"
          className={
            page === 'analysis' || page === 'result'
              ? 'active'
              : ''
          }
          onClick={() => setPage('analysis')}
          aria-current={
            page === 'analysis' || page === 'result'
              ? 'page'
              : undefined
          }
        >
          원단 분석
        </button>

        <button
          type="button"
          className={page === 'my' ? 'active' : ''}
          onClick={() => setPage('my')}
          aria-current={page === 'my' ? 'page' : undefined}
        >
          MY
        </button>
      </nav>
    </div>
  )
}

export default App