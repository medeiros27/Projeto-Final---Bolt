import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils';
import DiligenceForm from '../DiligenceForm';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('DiligenceForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/título da diligência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição detalhada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de diligência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor oferecido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data e hora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /criar diligência/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/este campo é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('updates suggested value when type changes', async () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const typeSelect = screen.getByLabelText(/tipo de diligência/i);
    fireEvent.change(typeSelect, { target: { value: 'Preposto Trabalhista Presencial Conciliação Inicial' } });

    const valueInput = screen.getByLabelText(/valor oferecido/i) as HTMLInputElement;
    
    await waitFor(() => {
      expect(valueInput.value).toBe('300');
    });
  });

  it('handles file upload', () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText(/selecionar arquivos/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('removes files when remove button is clicked', () => {
    render(<DiligenceForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const fileInput = screen.getByLabelText(/selecionar arquivos/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(removeButton);

    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      title: 'Test Diligence',
      description: 'Test description',
      type: 'Preposto Trabalhista Presencial Conciliação Inicial',
      priority: 'high' as const,
      value: 500,
      deadline: '2024-12-25T10:00',
      city: 'São Paulo',
      state: 'SP',
      attachments: []
    };

    render(
      <DiligenceForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        initialData={initialData}
        isEditing={true}
      />
    );

    expect(screen.getByDisplayValue('Test Diligence')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar diligência/i })).toBeInTheDocument();
  });
});