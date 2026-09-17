import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api, getErrorMessage, type Vehicle } from '../api/client';
import { FlowShell } from '../components/FlowShell';
import {
  Alert,
  Button,
  ErrorText,
  Field,
  Grid2,
  Input,
  Label,
  Select,
  StepActions,
} from '../components/ui';

const schema = z.object({
  vehicle_type: z.enum(['MOTORCYCLE', 'CAR', 'PICKUP', 'VAN', 'TRUCK']),
  make: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  year: z
    .string()
    .min(1, 'Required')
    .transform((v) => Number(v))
    .pipe(z.number().min(1980).max(2100)),
  registration_number: z.string().min(1, 'Required'),
  colour: z.string().min(1, 'Required'),
  ownership: z.string().min(1, 'Required'),
});

type FormValues = z.input<typeof schema>;
type SubmitValues = z.output<typeof schema>;

export function VehiclePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicle_type: 'CAR',
      year: String(new Date().getFullYear()),
      ownership: 'Owned',
    },
  });

  const vehicleType = watch('vehicle_type');

  useEffect(() => {
    api
      .get<Vehicle>('/api/driver/vehicle')
      .then(({ data }) => {
        if (!data.vehicle_type) return;
        reset({
          vehicle_type: data.vehicle_type as FormValues['vehicle_type'],
          make: data.make || '',
          model: data.model || '',
          year: String(data.year || new Date().getFullYear()),
          registration_number: data.registration_number || '',
          colour: data.colour || '',
          ownership: data.ownership || 'Owned',
        });
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'We could not load vehicle details. Please try again.')),
      );
  }, [reset]);

  const onSubmit = async (values: SubmitValues) => {
    setError('');
    try {
      await api.put('/api/driver/vehicle', values);
      navigate('/onboarding/documents');
    } catch (err) {
      setError(getErrorMessage(err, 'We could not save your vehicle details. Please try again.'));
    }
  };

  const typeHint =
    vehicleType === 'MOTORCYCLE'
      ? ' Helmet and two-wheeler insurance apply later.'
      : vehicleType === 'TRUCK'
        ? ' Commercial registration is typically required.'
        : '';

  return (
    <FlowShell
      step={3}
      eyebrow="Fleet ready"
      title="Vehicle details"
      subtitle={`Tell us about the vehicle you will use for deliveries.${typeHint}`}
    >
      {error && <Alert $tone="error">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field>
          <Label htmlFor="vehicle_type">Vehicle type</Label>
          <Select id="vehicle_type" {...register('vehicle_type')}>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="CAR">Car</option>
            <option value="PICKUP">Pickup</option>
            <option value="VAN">Van</option>
            <option value="TRUCK">Truck</option>
          </Select>
        </Field>
        <Grid2>
          <Field>
            <Label htmlFor="make">Make</Label>
            <Input id="make" placeholder="Toyota" {...register('make')} />
            {errors.make && <ErrorText>{errors.make.message}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="model">Model</Label>
            <Input id="model" placeholder="Corolla" {...register('model')} />
            {errors.model && <ErrorText>{errors.model.message}</ErrorText>}
          </Field>
        </Grid2>
        <Grid2>
          <Field>
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" {...register('year')} />
            {errors.year && <ErrorText>{errors.year.message}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="colour">Colour</Label>
            <Input id="colour" {...register('colour')} />
            {errors.colour && <ErrorText>{errors.colour.message}</ErrorText>}
          </Field>
        </Grid2>
        <Field>
          <Label htmlFor="registration_number">Registration number</Label>
          <Input
            id="registration_number"
            placeholder="TEST 1234"
            {...register('registration_number')}
          />
          {errors.registration_number && (
            <ErrorText>{errors.registration_number.message}</ErrorText>
          )}
        </Field>
        <Field>
          <Label htmlFor="ownership">Vehicle ownership</Label>
          <Select id="ownership" {...register('ownership')}>
            <option value="Owned">Owned</option>
            <option value="Family">Family-owned</option>
            <option value="Company">Company</option>
            <option value="Leased">Leased</option>
          </Select>
        </Field>
        <StepActions>
          <Button $variant="secondary" type="button" onClick={() => navigate('/onboarding/identity')}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Continue'}
          </Button>
        </StepActions>
      </form>
    </FlowShell>
  );
}
