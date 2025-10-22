import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datePt'
})
export class DatePtPipe implements PipeTransform {
  transform(value: string | Date, format: 'short' | 'month' = 'short'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value + 'T00:00:00') : value;
    
    if (format === 'short') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    if (format === 'month') {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} de ${year}`;
    }
    
    return value.toString();
  }
}
