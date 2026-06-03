import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i <= Math.round(rating) ? 'var(--warning)' : 'none'} stroke="var(--warning)" strokeWidth="1.2">
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
        </svg>
      ))}
    </div>
  )
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addedMsg, setAddedMsg] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('specs')
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))

    api.get(`/reviews/by_product/?product_id=${id}`)
      .then(res => setReviews(res.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false))

    if (user) {
      api.get(`/favorites/check/?product_id=${id}`)
        .then(res => setIsFavorite(res.data.is_favorite))
        .catch(() => {})
    }
  }, [id])

  const addToCart = async () => {
    setAdding(true)
    try {
      await api.post('/orders/cart/add_item/', { product_id: product.id, quantity })
      setAddedMsg(t('products.added'))
      setTimeout(() => setAddedMsg(''), 2500)
    } catch {
      setAddedMsg(t('products.cartError'))
      setTimeout(() => setAddedMsg(''), 2000)
    }
    setAdding(false)
  }

  const toggleFavorite = async () => {
    if (!user) return
    setFavLoading(true)
    try {
      if (isFavorite) {
        await api.delete('/favorites/remove/', { data: { product_id: product.id } })
        setIsFavorite(false)
      } else {
        await api.post('/favorites/add/', { product_id: product.id })
        setIsFavorite(true)
      }
    } catch {}
    setFavLoading(false)
  }

  const submitReview = async () => {
    if (!user) return
    setSubmittingReview(true)
    setReviewMsg('')
    try {
      const res = await api.post('/reviews/create_review/', {
        product: parseInt(id),
        rating: reviewForm.rating,
        text: reviewForm.text,
      })
      setReviews(prev => [res.data, ...prev])
      setReviewForm({ rating: 5, text: '' })
      setReviewMsg(t('products.reviewSubmitted'))
      setTimeout(() => setReviewMsg(''), 3000)
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || t('products.reviewError')
      setReviewMsg(msg)
    }
    setSubmittingReview(false)
  }

  if (loading) {
    return (
      <Layout>
        <div style={s.loadingGrid}>
          <div style={s.loadingImg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ ...s.loadingLine, width: '60%' }} />
            <div style={{ ...s.loadingLine, width: '40%', height: '36px' }} />
            <div style={{ ...s.loadingLine, width: '80%' }} />
            <div style={{ ...s.loadingLine, width: '50%' }} />
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) return null

  const hasSpecs = product.specifications?.length > 0
  const hasReviews = reviews.length > 0

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes addedAnim {
          0% { opacity: 0; transform: translateY(4px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .thumb-item {
          width: 68px; height: 68px;
          border-radius: 8px; overflow: hidden;
          cursor: pointer;
          transition: border-color 0.15s;
          flex-shrink: 0;
        }
        .qty-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 18px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .qty-btn:hover { border-color: var(--accent); background: var(--accent-dim); }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tab-btn {
          padding: 9px 18px;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          border: none; background: none;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .tab-btn:hover { color: var(--text-primary); }
        .tab-btn-active {
          padding: 9px 18px;
          font-size: 13px; font-weight: 600;
          cursor: default;
          border: none; background: none;
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          font-family: inherit;
          white-space: nowrap;
        }
        .star-pick {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform 0.1s;
          font-size: 22px;
          line-height: 1;
        }
        .star-pick:hover { transform: scale(1.2); }
        .review-textarea {
          width: 100%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .review-textarea:focus { border-color: var(--accent); }
        .review-textarea::placeholder { color: var(--text-secondary); }
        .submit-review-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s;
        }
        .submit-review-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
        .submit-review-btn:disabled { background: var(--text-muted); cursor: not-allowed; transform: none; }
        .add-cart-btn {
          flex: 1;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }
        .add-cart-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-btn);
        }
        .add-cart-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
        .fav-btn {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .fav-btn:hover { border-color: var(--danger); background: rgba(248,113,113,0.08); }
      `}</style>

      <div style={s.breadcrumb}>
        <Link to="/products" style={s.breadLink}>{t('nav.products')}</Link>
        <span style={s.breadSep}>/</span>
        {product.category && (
          <>
            <span style={s.breadText}>{product.category.name}</span>
            <span style={s.breadSep}>/</span>
          </>
        )}
        <span style={s.breadCurrent}>{product.name}</span>
      </div>

      <div style={s.mainGrid}>
        <div style={s.galleryCol}>
          <div style={s.mainImgWrap}>
            {product.images?.length > 0
              ? <img src={product.images[activeImg].image} alt={product.name} style={s.mainImg} />
              : (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--border-hover)" strokeWidth="1.2" strokeLinecap="round">
                  <rect x="4" y="8" width="56" height="38" rx="4"/>
                  <path d="M20 52h24M32 46v6"/>
                </svg>
              )
            }
            {!product.is_available && (
              <div style={s.outBadge}>{t('products.outOfStock')}</div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div style={s.thumbsRow}>
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="thumb-item"
                  style={{ border: `2px solid ${i === activeImg ? 'var(--accent)' : 'var(--border)'}` }}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.infoCol}>
          <div style={s.typeBadge}>{product.product_type}</div>
          <h1 style={s.productName}>{product.name}</h1>

          <div style={s.metaRow}>
            {product.brand && <span style={s.brandName}>{product.brand.name}</span>}
            {product.brand && product.category && <span style={s.metaDot}>·</span>}
            {product.category && <span style={s.categoryName}>{product.category.name}</span>}
          </div>

          {product.average_rating > 0 && (
            <div style={s.ratingRow}>
              <StarRating rating={product.average_rating} />
              <span style={s.ratingVal}>{Number(product.average_rating).toFixed(1)}</span>
              <span style={s.ratingCount}>({product.total_reviews} {t('products.reviews')})</span>
            </div>
          )}

          <div style={s.priceLine}>
            <span style={s.price}>${product.price}</span>
            {product.stock > 0 ? (
              <span style={s.inStock}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
                {t('products.inStock')} · {t('products.lowStock', { count: product.stock })}
              </span>
            ) : (
              <span style={s.outStock}>{t('products.outOfStock')}</span>
            )}
          </div>

          {product.description && (
            <p style={s.description}>{product.description}</p>
          )}

          <div style={s.qtyRow}>
            <span style={s.qtyLabel}>{t('products.quantity')}</span>
            <div style={s.qtyControls}>
              <button
                className="qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span style={s.qtyNum}>{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          <div style={s.actionsRow}>
            <button
              className="add-cart-btn"
              onClick={addToCart}
              disabled={adding || !product.is_available || product.stock === 0}
            >
              {adding
                ? t('products.adding')
                : product.stock === 0
                  ? t('products.outOfStock')
                  : `${t('products.addToCart')} · $${(product.price * quantity).toFixed(2)}`
              }
            </button>
            {user && (
              <button
                className="fav-btn"
                onClick={toggleFavorite}
                disabled={favLoading}
                title={isFavorite ? t('favorites.remove') : t('products.addToCart')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill={isFavorite ? 'var(--danger)' : 'none'} stroke={isFavorite ? 'var(--danger)' : 'var(--text-secondary)'} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 17s-7-4.5-7-9a4 4 0 0 1 7-2.7A4 4 0 0 1 17 8c0 4.5-7 9-7 9z"/>
                </svg>
              </button>
            )}
          </div>

          {addedMsg && (
            <div style={s.addedMsg}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 7l4 4 6-6"/>
              </svg>
              {addedMsg}
            </div>
          )}

          {product.seller_name && (
            <div style={s.sellerInfo}>
              <div style={s.sellerAvatar}>{product.seller_name[0]?.toUpperCase()}</div>
              <div>
                <p style={s.sellerLabel}>{t('products.seller')}</p>
                <p style={s.sellerName}>{product.seller_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={s.tabsSection}>
        <div style={s.tabsBar}>
          {hasSpecs && (
            <button
              className={activeTab === 'specs' ? 'tab-btn-active' : 'tab-btn'}
              onClick={() => setActiveTab('specs')}
            >
              {t('products.specifications')}
            </button>
          )}
          <button
            className={activeTab === 'reviews' ? 'tab-btn-active' : 'tab-btn'}
            onClick={() => setActiveTab('reviews')}
          >
            {t('products.reviewsTab')} {reviews.length > 0 && `(${reviews.length})`}
          </button>
        </div>

        <div style={s.tabContent}>
          {activeTab === 'specs' && hasSpecs && (
            <div style={s.specsGrid}>
              {product.specifications.map((spec, i) => (
                <div key={i} style={s.specRow}>
                  <span style={s.specKey}>{spec.key}</span>
                  <span style={s.specVal}>{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {user && (
                <div style={s.reviewForm}>
                  <p style={s.reviewFormTitle}>{t('products.writeReview')}</p>
                  <div style={s.starPicker}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        className="star-pick"
                        onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                      >
                        <span style={{ color: star <= reviewForm.rating ? 'var(--warning)' : 'var(--border-hover)' }}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span style={s.starPickLabel}>{reviewForm.rating}/5</span>
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder={t('products.reviewPlaceholder')}
                    value={reviewForm.text}
                    onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                    rows={3}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                      className="submit-review-btn"
                      onClick={submitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? t('products.submittingReview') : t('products.submitReview')}
                    </button>
                    {reviewMsg && (
                      <span style={{ color: reviewMsg.includes('Error') || reviewMsg.includes('already') ? 'var(--danger)' : 'var(--success)', fontSize: '13px' }}>
                        {reviewMsg}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {[1,2,3].map(i => <div key={i} style={{ ...s.reviewSkeleton, animationDelay: `${i * 0.1}s` }} />)}
                </div>
              ) : !hasReviews ? (
                <div style={s.noReviews}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M16 2l2.4 7.2H26l-6.2 4.5 2.4 7.3L16 17l-6.2 4 2.4-7.3L6 9.2h7.6z"/>
                  </svg>
                  <p style={s.noReviewsText}>{t('products.noReviews')}</p>
                </div>
              ) : (
                <div style={s.reviewsList}>
                  {reviews.map(r => (
                    <div key={r.id} style={s.reviewCard}>
                      <div style={s.reviewHeader}>
                        <div style={s.reviewAvatar}>
                          {r.user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={s.reviewTop}>
                            <span style={s.reviewUser}>{r.user?.username || 'User'}</span>
                            <span style={s.reviewDate}>
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <StarRating rating={r.rating} size={13} />
                        </div>
                      </div>
                      {r.text && <p style={s.reviewText}>{r.text}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

const s = {
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
  },
  loadingImg: {
    height: '400px',
    borderRadius: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  loadingLine: {
    height: '20px',
    borderRadius: '6px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  breadLink: {
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  breadSep: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  breadText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  breadCurrent: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    marginBottom: '40px',
    animation: 'fadeUp 0.4s ease both',
  },
  galleryCol: {},
  mainImgWrap: {
    height: '400px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    position: 'relative',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  outBadge: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  thumbsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  typeBadge: {
    display: 'inline-block',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: '4px',
    marginBottom: '10px',
    alignSelf: 'flex-start',
  },
  productName: {
    color: 'var(--text-primary)',
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.3px',
    marginBottom: '10px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  brandName: {
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '600',
  },
  metaDot: {
    color: 'var(--text-muted)',
  },
  categoryName: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  ratingVal: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '700',
  },
  ratingCount: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  priceLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  price: {
    color: 'var(--accent)',
    fontSize: '34px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  inStock: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'var(--success)',
    fontSize: '12px',
    fontWeight: '600',
  },
  outStock: {
    color: 'var(--danger)',
    fontSize: '12px',
    fontWeight: '600',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
  qtyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  qtyLabel: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  qtyNum: {
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: '700',
    minWidth: '24px',
    textAlign: 'center',
  },
  actionsRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  addedMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--success)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '16px',
    animation: 'addedAnim 2.5s ease forwards',
  },
  sellerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginTop: '8px',
  },
  sellerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sellerLabel: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '500',
    marginBottom: '1px',
  },
  sellerName: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
  },
  tabsSection: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    animation: 'fadeUp 0.4s ease 0.1s both',
  },
  tabsBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    padding: '0 4px',
  },
  tabContent: {
    padding: '24px',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    gap: '16px',
  },
  specKey: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  specVal: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'right',
  },
  reviewForm: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  reviewFormTitle: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  starPicker: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  starPickLabel: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    marginLeft: '6px',
  },
  reviewSkeleton: {
    height: '80px',
    borderRadius: '10px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    animation: 'skeletonPulse 1.4s ease infinite',
  },
  noReviews: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '40px',
  },
  noReviewsText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewCard: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px',
  },
  reviewHeader: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  reviewAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  reviewUser: {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
  },
  reviewDate: {
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
  reviewText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.6',
    marginTop: '6px',
  },
}

export default ProductDetailPage