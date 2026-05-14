import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateMessage } from '@/store/slices/chatSlice'
import { Button } from '@/components/ui/shadCN/button'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductDetailCard } from '@/components/ProductDetailCard'
import NewsletterFlow from '@/components/flows/NewsletterFlow'
import MobelaboFlow from '@/components/flows/MobelaboFlow'
import SearchServiceFlow from '@/components/flows/SearchServiceFlow'
import RegisterAuthForm from '@/components/flows/RegisterAuthForm'
import LoginAuthForm from '@/components/flows/LoginAuthForm'
import { createAuthUser, sendAuthMagicLink } from '@/services/authApi'
import { GeneralChoiceMenu } from '@/components/GeneralChoiceMenu'
import { TextContent } from '@/components/TextContent'
import { TypewriterText } from '@/components/TypewriterText'
import { cn } from '@/utils/utils'
import {
  createInitialAuthRegisterWizardState,
  type GeneralChoiceOption,
  type Message as MessageType,
  type MessageContent,
} from '@/types/chat'
import type { MessageProductDetail } from '@/types/chat'

interface MessageProps {
  message: MessageType
  onButtonClick?: (action: string, buttonIndex: number) => void
  onProductSelect?: (messageId: string, product: NonNullable<MessageContent['productDetail']>) => void
  onProductDetailBack?: (messageId: string) => void
  onStartBooking?: (productId?: string) => void
  /** UI-only flag: when true, the message is temporarily transformed into the product detail view */
  isProductDetailActive?: boolean
  /** UI-only product to show while transforming (does not mutate redux message content) */
  productDetailOverride?: MessageProductDetail
  /** If false, skip typewriter effect and show full text immediately (for old/restored messages) */
  isNewMessage?: boolean
  onNewsletterSubscribe?: (email: string) => Promise<void>
  onGeneralChoiceSelect?: (option: GeneralChoiceOption) => void
}

function Message({
  message,
  onButtonClick,
  onProductSelect,
  onStartBooking,
  onProductDetailBack,
  isProductDetailActive = false,
  productDetailOverride,
  isNewMessage = true,
  onNewsletterSubscribe,
  onGeneralChoiceSelect,
}: MessageProps) {
  const dispatch = useAppDispatch()
  const [textComplete, setTextComplete] = useState(false)
  const isUser = message.role === 'user'
  const content: MessageContent =
    typeof message.content === 'string' ? { text: message.content } : message.content

  const showingProductDetail = Boolean(isProductDetailActive && productDetailOverride)
  // Restore original content after reload/close by using productDetailSource when present.
  const renderContent: MessageContent = content.productDetailSource ?? content

  useEffect(() => {
    // If user enters product detail, lock text to completed so returning never retriggers typing.
    if (showingProductDetail) setTextComplete(true)
  }, [showingProductDetail])

  return (
    <div
      className={cn(
        'flex gap-3 w-full min-w-0',
        isNewMessage && 'animate-in fade-in-0 duration-[1200ms] ease-out',
        isUser ? 'justify-end' : 'justify-start',
        isNewMessage && (isUser ? 'slide-in-from-right-6' : 'slide-in-from-left-6')
      )}
    >
      <div className={cn('flex w-full', isUser ? 'justify-end' : 'flex-col')}>
      <ChatBubble
        variant={isUser ? 'user' : 'assistant'}
        className={cn(
          'w-fit lg:min-w-[200px]',
          isUser
            ? 'ml-auto max-w-[min(78%,30rem)] sm:max-w-[min(78%,30rem)]'
            : renderContent.searchServiceWizard ||
                renderContent.authRegisterWizard ||
                renderContent.authLoginWizard
              ? 'max-w-[min(96%,28rem)] sm:max-w-[min(96%,28rem)]'
              : 'max-w-[80%] sm:max-w-[80%]',
        )}
      >
        {showingProductDetail ? (
          productDetailOverride ? (
            <ProductDetailCard
              product={productDetailOverride}
              onBack={() => onProductDetailBack?.(message.id)}
              onStartBooking={onStartBooking}
            />
          ) : null
        ) : (
          <>
            {/* Images */}
            {renderContent.images && renderContent.images.length > 0 && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                {renderContent.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.src}
                    alt={image.alt || `Image ${index + 1}`}
                    className="rounded-md border border-border bg-muted w-full aspect-square object-cover"
                  />
                ))}
              </div>
            )}

            {/* Text Content */}
            {renderContent.text &&
              (isUser ? (
                <TextContent
                  variant="textMedium"
                  className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
                >
                  {renderContent.text}
                </TextContent>
              ) : isNewMessage && !textComplete ? (
                <TypewriterText
                  text={renderContent.text}
                  speed={25}
                  onComplete={() => setTextComplete(true)}
                >
                  {(visibleText) => (
                    <TextContent
                      variant="textMedium"
                      className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
                    >
                      {visibleText}
                    </TextContent>
                  )}
                </TypewriterText>
              ) : (
                <TextContent
                  variant="textMedium"
                  className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
                >
                  {renderContent.text}
                </TextContent>
              ))}

            {renderContent.newsletterSignup &&
              onNewsletterSubscribe &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <NewsletterFlow
                  variant="inline"
                  onSubscribe={onNewsletterSubscribe}
                  onEnterSecondStep={() => {
                    const next: MessageContent =
                      typeof message.content === 'string'
                        ? { text: '' }
                        : { ...message.content, text: '' }
                    dispatch(updateMessage({ id: message.id, content: next }))
                  }}
                  onRequestRegister={(prefillEmail) => {
                    const base: MessageContent =
                      typeof message.content === 'string'
                        ? { text: message.content }
                        : { ...message.content }
                    dispatch(
                      updateMessage({
                        id: message.id,
                        content: {
                          ...base,
                          newsletterSignup: false,
                          authRegisterWizard: {
                            ...createInitialAuthRegisterWizardState(),
                            email: prefillEmail,
                          },
                        },
                      }),
                    )
                  }}
                />
              )}

            {renderContent.generalChoiceMenu &&
              onGeneralChoiceSelect &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <GeneralChoiceMenu onSelect={onGeneralChoiceSelect} />
              )}

            {renderContent.mobelaboWizard &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <div className="mt-3 w-full min-w-0">
                  <MobelaboFlow
                    state={renderContent.mobelaboWizard}
                    onChange={(next) => {
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      dispatch(updateMessage({ id: message.id, content: { ...base, mobelaboWizard: next } }))
                    }}
                  />
                </div>
              )}

            {renderContent.searchServiceWizard &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <div className="mt-3 w-full min-w-0">
                  <SearchServiceFlow
                    state={renderContent.searchServiceWizard}
                    onChange={(next) => {
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      dispatch(
                        updateMessage({ id: message.id, content: { ...base, searchServiceWizard: next } }),
                      )
                    }}
                  />
                </div>
              )}

            {renderContent.authRegisterWizard &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <div className="mt-3 w-full min-w-0">
                  <RegisterAuthForm
                    state={renderContent.authRegisterWizard}
                    onChange={(next) => {
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      dispatch(
                        updateMessage({
                          id: message.id,
                          content: { ...base, authRegisterWizard: { ...next, submitError: undefined } },
                        }),
                      )
                    }}
                    onSubmit={async () => {
                      const w = renderContent.authRegisterWizard
                      if (!w) return
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      try {
                        await createAuthUser({
                          email: w.email.trim(),
                          first_name: w.firstName.trim(),
                          name: w.name.trim(),
                          zip: w.zip.trim(),
                        })
                        dispatch(
                          updateMessage({
                            id: message.id,
                            content: {
                              ...base,
                              authRegisterWizard: undefined,
                              text: `Thanks, ${w.firstName.trim()}! Your account was created successfully.`,
                            },
                          }),
                        )
                      } catch (err) {
                        const messageText = err instanceof Error ? err.message : 'Registration failed'
                        dispatch(
                          updateMessage({
                            id: message.id,
                            content: {
                              ...base,
                              authRegisterWizard: { ...w, submitError: messageText },
                            },
                          }),
                        )
                      }
                    }}
                  />
                </div>
              )}

            {renderContent.authLoginWizard &&
              !isUser &&
              (textComplete ||
                !isNewMessage ||
                !(typeof renderContent.text === 'string' && renderContent.text.trim())) && (
                <div className="mt-3 w-full min-w-0">
                  <LoginAuthForm
                    state={renderContent.authLoginWizard}
                    onChange={(next) => {
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      dispatch(
                        updateMessage({
                          id: message.id,
                          content: {
                            ...base,
                            authLoginWizard: {
                              email: next.email ?? '',
                              submitError: undefined,
                            },
                          },
                        }),
                      )
                    }}
                    onSubmit={async () => {
                      const w = renderContent.authLoginWizard
                      if (!w) return
                      const base: MessageContent =
                        typeof message.content === 'string'
                          ? { text: message.content }
                          : { ...message.content }
                      const email = (w.email ?? '').trim()
                      try {
                        await sendAuthMagicLink({
                          email,
                          name: 'customer',
                        })
                        dispatch(
                          updateMessage({
                            id: message.id,
                            content: {
                              ...base,
                              authLoginWizard: undefined,
                              text: `Check your inbox at ${email} for your magic sign-in link.`,
                            },
                          }),
                        )
                      } catch (err) {
                        const messageText = err instanceof Error ? err.message : 'Could not send magic link'
                        dispatch(
                          updateMessage({
                            id: message.id,
                            content: {
                              ...base,
                              authLoginWizard: {
                                email: w.email ?? '',
                                submitError: messageText,
                              },
                            },
                          }),
                        )
                      }
                    }}
                  />
                </div>
              )}

            {/* Product grid – show only after text is fully printed (or immediately for old messages) */}
            {renderContent.productIds && renderContent.productIds.length > 0 && (
              (textComplete || !isNewMessage) && (
                <ProductGrid
                  productIds={renderContent.productIds}
                  onProductSelect={(product) => onProductSelect?.(message.id, product)}
                />
              )
            )}

            {/* Product cards – show only after text is fully printed (or immediately for old messages) */}
            {renderContent.productCards && renderContent.productCards.length > 0 && (textComplete || !isNewMessage) && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {renderContent.productCards.map((card, index) => (
                  <a
                    key={index}
                    href={card.product_url ?? card.href ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md overflow-hidden border border-border bg-muted hover:border-foreground/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={card.title}
                  >
                    <img
                      src={card.src}
                      alt={card.alt || card.title || `Product ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Buttons – show only after text is fully printed (or immediately for old messages) */}
            {renderContent.buttons && renderContent.buttons.length > 0 && (textComplete || !isNewMessage) && (
              <div className="mt-3 lg:mt-[15.5px] flex flex-wrap gap-2">
                {renderContent.buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant || 'outline'}
                    size="sm"
                    className="rounded-full px-4 py-3"
                    onClick={() => {
                      if (typeof button.onClick === 'function') {
                        button.onClick()
                      }
                      if (onButtonClick) {
                        onButtonClick(button.label.toLowerCase().replace(/\s+/g, '_'), index)
                      }
                    }}
                  >
                    <TextContent variant="buttonText" className="text-text-inverse">
                      {button.label}
                    </TextContent>
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </ChatBubble>
      </div>
    </div>
  )
}

export default Message

