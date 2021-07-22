import React from 'react'
import { RegisterOptions } from 'react-hook-form'
import { renderHook } from '@testing-library/react-hooks'
import { render, fireEvent, screen, act } from '@testing-library/react'

import { TextField } from '../../types'
import { useShortAnswerInput } from '../useShortAnswerInput'
import { MockGoogleFormComponent, mockGetField } from './helpers/utils'

describe('useShortAnswerInput', () => {
  const mockShortAnswerField: TextField = {
    id: 'short_answer',
    label: 'Short Answer Question',
    type: 'SHORT_ANSWER',
    required: false
  }
  let output = {}
  const onSubmit = (data: object) => {
    output = data
  }

  const ShortAnswerComponent = (props: { options?: RegisterOptions }) => {
    const { register, error } = useShortAnswerInput(mockShortAnswerField.id)
    return (
      <>
        <input type='text' {...register(props.options)} />
        {error && <span>Error {error.type}</span>}
      </>
    )
  }

  const renderComponent = (options?: RegisterOptions) =>
    render(
      <MockGoogleFormComponent onSubmit={onSubmit}>
        <ShortAnswerComponent options={options}></ShortAnswerComponent>
      </MockGoogleFormComponent>
    )

  const submitForm = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }))
    })
  }

  const fillTextField = async (value: string) => {
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: value }
      })
    })
  }

  beforeEach(() => {
    mockGetField.mockImplementation(() => mockShortAnswerField)
  })

  afterEach(() => {
    output = {}
  })

  it('returns the correspondent field information', () => {
    const { result } = renderHook(
      () => useShortAnswerInput(mockShortAnswerField.id),
      {
        wrapper: MockGoogleFormComponent
      }
    )

    expect(result.current).toMatchObject(mockShortAnswerField)
  })

  it('registers the field correctly', async () => {
    renderComponent()

    await fillTextField('xico')

    await submitForm()

    expect(output).toEqual({
      [mockShortAnswerField.id]: 'xico'
    })
  })

  describe('when the field is required', () => {
    const requiredMockField = {
      ...mockShortAnswerField,
      required: true
    }
    beforeEach(() => {
      mockGetField.mockClear()
      mockGetField.mockImplementation(() => requiredMockField)
    })

    it('gives an error when the field is not filled', async () => {
      renderComponent()

      await submitForm()

      expect(screen.getByText('Error required')).toBeVisible()
    })
  })

  describe('when other validations are passed to the register method', () => {
    it('gives a validation error when it does not comply the validation', async () => {
      renderComponent({ minLength: 3 })

      await fillTextField('xi')

      await submitForm()

      expect(screen.getByText('Error minLength')).toBeVisible()
    })
  })
})
