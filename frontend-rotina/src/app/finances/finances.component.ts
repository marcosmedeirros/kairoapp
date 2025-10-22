import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.css']
})
export class FinancesComponent implements OnInit {
  month: string = '';

  // Totais
  summary: any = { income: 0, expense: 0, balance: 0, byCategory: [], month: '' };

  // Meses com movimentações
  availableMonths: string[] = [];

  // Categorias
  categories: any[] = [];
  newCategory = { name: '' };
  editingCategoryId: number | null = null;
  editedCategory: any = null;

  // Transações
  transactions: any[] = [];
  newTransaction: any = {
    date: '',
    amount: null,
    type: 'EXPENSE',
    categoryId: null,
    description: ''
  };
  editingTransactionId: number | null = null;
  editedTransaction: any = null;

  // Modal de remoção
  showDeleteModal: boolean = false;
  itemToDelete: any = null;
  deleteType: 'transaction' | 'category' = 'transaction';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.month = `${y}-${m}`;
    this.newTransaction.date = `${y}-${m}-${d}`;

    this.fetchCategories();
    this.fetchAvailableMonths();
    this.fetchSummary();
    this.fetchTransactions();
  }

  // === CATEGORIAS ===
  fetchCategories() {
    this.http.get<any[]>('/api/finance/categories').subscribe(data => {
      this.categories = data || [];
    });
  }

  // === MESES DISPONÍVEIS ===
  fetchAvailableMonths() {
    this.http.get<any[]>('/api/finance/transactions').subscribe(data => {
      const monthsSet = new Set<string>();
      (data || []).forEach((tx: any) => {
        if (tx.date) {
          const dateObj = new Date(tx.date + 'T00:00:00');
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          monthsSet.add(`${y}-${m}`);
        }
      });
      this.availableMonths = Array.from(monthsSet).sort().reverse();
    });
  }

  addCategory() {
    if (!this.newCategory.name.trim()) return;
    this.http.post('/api/finance/categories', this.newCategory).subscribe(() => {
      this.newCategory = { name: '' };
      this.fetchCategories();
    });
  }

  startEditCategory(cat: any) {
    this.editingCategoryId = cat.id;
    this.editedCategory = { name: cat.name };
  }

  cancelEditCategory() {
    this.editingCategoryId = null;
    this.editedCategory = null;
  }

  saveEditCategory(cat: any) {
    this.http.put(`/api/finance/categories/${cat.id}`, this.editedCategory).subscribe(() => {
      this.editingCategoryId = null;
      this.editedCategory = null;
      this.fetchCategories();
      this.fetchTransactions();
      this.fetchSummary();
    });
  }

  openDeleteCategory(cat: any) {
    this.itemToDelete = cat;
    this.deleteType = 'category';
    this.showDeleteModal = true;
  }

  // === TRANSAÇÕES ===
  fetchTransactions() {
    this.http.get<any[]>(`/api/finance/transactions?month=${this.month}`).subscribe(data => {
      this.transactions = data || [];
    });
  }

  addTransaction() {
    if (!this.newTransaction.amount || !this.newTransaction.categoryId) {
      alert('Informe valor e categoria');
      return;
    }
    this.http.post('/api/finance/transactions', this.newTransaction).subscribe(() => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      this.newTransaction = { date: `${y}-${m}-${d}`, amount: null, type: 'EXPENSE', categoryId: null, description: '' };
      this.fetchTransactions();
      this.fetchSummary();
      this.fetchAvailableMonths();
    });
  }

  startEditTransaction(tx: any) {
    this.editingTransactionId = tx.id;
    this.editedTransaction = {
      date: tx.date,
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.category?.id,
      description: tx.description || ''
    };
  }

  cancelEditTransaction() {
    this.editingTransactionId = null;
    this.editedTransaction = null;
  }

  saveEditTransaction(tx: any) {
    if (!this.editedTransaction.amount || !this.editedTransaction.categoryId) {
      alert('Informe valor e categoria');
      return;
    }
    this.http.put(`/api/finance/transactions/${tx.id}`, this.editedTransaction).subscribe(() => {
      this.editingTransactionId = null;
      this.editedTransaction = null;
      this.fetchTransactions();
      this.fetchSummary();
      this.fetchAvailableMonths();
    });
  }

  openDeleteTransaction(tx: any) {
    this.itemToDelete = tx;
    this.deleteType = 'transaction';
    this.showDeleteModal = true;
  }

  // === RESUMO ===
  fetchSummary() {
    this.http.get<any>(`/api/finance/summary?month=${this.month}`).subscribe(data => {
      this.summary = data || { income: 0, expense: 0, balance: 0, byCategory: [], month: this.month };
    });
  }

  // === FILTROS ===
  onMonthChange() {
    this.fetchTransactions();
    this.fetchSummary();
  }

  selectMonth(m: string) {
    this.month = m;
    this.fetchTransactions();
    this.fetchSummary();
  }

  // === MODAL ===
  closeDeleteModal() {
    this.itemToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    if (this.deleteType === 'transaction') {
      this.http.delete(`/api/finance/transactions/${this.itemToDelete.id}`).subscribe(() => {
        this.closeDeleteModal();
        this.fetchTransactions();
        this.fetchSummary();
        this.fetchAvailableMonths();
      });
    } else {
      this.http.delete(`/api/finance/categories/${this.itemToDelete.id}`).subscribe(() => {
        this.closeDeleteModal();
        this.fetchCategories();
        // ao remover categoria, também atualiza o resumo e lista
        this.fetchTransactions();
        this.fetchSummary();
      });
    }
  }
}
