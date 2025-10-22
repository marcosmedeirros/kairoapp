import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthNamePt'
})
export class MonthNamePtPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // value format: YYYY-MM
    const [year, month] = value.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[monthIndex]} de ${year}`;
  }
}
